<?php

namespace Drupal\webspark_utility\Drush\Commands;

use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;
use Drush\Drush;

/**
 * Webspark utility commands.
 */
final class WebsparkUtilityCommands extends DrushCommands {

  /**
   * Refresh webspark config files. Do not use in production.
   */
  #[CLI\Command(name: 'webspark:config-refresh', aliases: ['wcr'])]
  public function refreshConfigs() {
    $success = FALSE;
    // Turn on output buffering.
    ob_start();
    // Check if user is logged in.
    $logInCheck = exec('terminus auth:whoami 2>&1', $logInCheckOutput);
    $logInCheckOutputArray = array_map(fn($i) => str_contains($i, 'You are not logged in.'), $logInCheckOutput);
    if (in_array(true, $logInCheckOutputArray, true)) {
      $this->logger()->error('Your DDEV instance is currently not logged in to Pantheon via terminus.' . PHP_EOL .
        '  Please run "ddev ssh" and then run ' . PHP_EOL . '  "terminus auth:login --machine-token=$TERMINUS_MACHINE_TOKEN; exit" to authenticate.');
      return;
    }

    if (!(is_dir('../.ddev') && is_file('../.ddev/providers/pantheon.yaml'))) {
      $this->logger()->error('This command is intended for local use with DDEV only. Please install and configure DDEV locally and try again.');
      return;
    }
    // Only allow on webspark-ci and webspark-release-* repositories.
    $filename = '../.ddev/config.yaml';
    $handle = fopen($filename, "r");
    $firstLine = fgets($handle);
    fclose($handle);
    if (!str_contains($firstLine, 'webspark-ci') && !str_contains($firstLine, 'webspark-release-')) {
      $this->logger()->error('This command can only be run on the webspark-ci or webspark-release-* repositories.');
      return;
    }
    if (!$this->io()->confirm('Are you sure you want to refresh the webspark config files?')) {
      return;
    }
    if (!$this->io()->confirm('Are you on the latest "master" or "sprint" branch?')) {
      $this->logger()->error('Please checkout the latest "master" or "sprint" branch before running this command.');
      return;
    }

    // Run terminus command to get the latest database.
    $this->io()->writeln(' // Fetching latest database from the Webspark Release Stable site in Pantheon.' . PHP_EOL);
    $date = new \DateTime();
    $now = $date->getTimestamp();
    $getBackupDate = exec('terminus backup:info webspark-release-stable.dev --element=db --format=php');
    $backupDate = $getBackupDate ? unserialize($getBackupDate, ['allowed_classes' => TRUE])['date'] : NULL;
    if (empty($backupDate) || ($backupDate < ($now - 86400))) {
      // Create new backup if it doesn't exist or latest is older than 24 hours.
      $result = shell_exec('terminus backup:create webspark-release-stable.dev --element=db');
    }
    // Get latest backup.
    shell_exec('terminus backup:get webspark-release-stable.dev --element=db --to=../webspark-db-backup.sql.gz');

    // Create snapshot of current database.
    exec('mysqldump -uroot -proot db | gzip > ../webspark-db-snapshot' . $now . '.sql.gz');
    if (is_file('../webspark-db-snapshot' . $now . '.sql.gz')) {
      $this->io()->writeln(PHP_EOL . ' // Creating snapshot of current database...' . PHP_EOL);
    }

    // Import latest webspark release stable database into DDEV.
    $this->io()->writeln(' // Importing database from Webspark Release Stable...' . PHP_EOL);
    exec('zcat ../webspark-db-backup.sql.gz | mysql -uroot -proot db');

    // Import hook updates.
    $this->io()->writeln(' // Running update.php...' . PHP_EOL);
    exec('drush updb -y');

    $this->io()->writeln(PHP_EOL . ' // Updating configs...' . PHP_EOL);
    // Get array of modules that have a config/install subdirectory.
    $websparkPaths = (array) (glob('modules/webspark/*/config/install', GLOB_ONLYDIR)) ? glob('modules/webspark/*/config/install', GLOB_ONLYDIR) : [];
    // Add webspark profile configs to the array.
    $websparkPaths[] = 'profiles/webspark/webspark/config/install';
    // Export all configs per path, remove untracked files, & update remaining.
    foreach ($websparkPaths as $path) {
      $this->logger()->info('Updating YAML files at ' . $path);
      $self = Drush::aliasManager()->getSelf();
      // Run drush config:export on @self with destination set to the path.
      $process = $this->processManager()->drush($self, 'config:export', [], ['destination' => $path]);
      $process->run();
      // Remove untracked files from directory.
      $output = shell_exec('git clean -df -- ' . $path);
      // Handle output.
      switch (TRUE) {
        // Successful operation yields output beginning with "Removing".
        case preg_match('/^Removing.*$/m', $output):
          // Set directory glob path for recursive regex operations.
          $dir = $path . '/*';
          // Loop through files in directory.
          foreach (glob($dir) as $filename) {
            $file = file_get_contents($filename);
            // Delete UUID and default config hash.
            $file = preg_replace('/^uuid:\s[0-9a-z\-]+\n/m', '', $file);
            $file = preg_replace('/^_core:\n\s+default_config_hash:\s\'?[a-zA-Z0-9\_\-]+\'?\n?/m', '', $file);
            file_put_contents($filename, $file);
            $filesToSkip = [
              'profiles/webspark/webspark/config/install/block.block.asubrandheader.yml',
              'profiles/webspark/webspark/config/install/block.block.asufooter.yml',
              'profiles/webspark/webspark/config/install/system.site.yml',
              'modules/webspark/webspark_blocks/config/install/field.field.paragraph.card.field_card_link.yml',
              'modules/webspark/webspark_blocks/config/install/field.field.paragraph.card.field_clickable.yml',
              'modules/webspark/webspark_blocks/config/install/field.field.paragraph.card_with_icon.field_card_link.yml',
              'modules/webspark/webspark_blocks/config/install/field.field.paragraph.card_with_icon.field_clickable.yml',
              'modules/webspark/webspark_blocks/config/install/filter.format.basic_html.yml',
              'modules/webspark/webspark_blocks/config/install/filter.format.full_html.yml',
              'modules/webspark/webspark_blocks/config/install/filter.format.restricted_html.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card.field_card_link.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card.field_clickable.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card_degree.field_card_link.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card_degree.field_clickable.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card_story.field_card_link.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card_story.field_clickable.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card_with_icon.field_card_link.yml',
              'profiles/webspark/webspark/config/install/field.field.paragraph.card_with_icon.field_clickable.yml',
              'profiles/webspark/webspark/config/install/field.storage.paragraph.field_card_link.yml',
              'profiles/webspark/webspark/config/install/field.storage.paragraph.field_clickable.yml',
            ];
            if (in_array($filename, $filesToSkip, TRUE)) {
              // Reset file contents to original state.
              shell_exec('git restore --source=HEAD --staged --worktree -- ' . $filename . ' 2>&1');
            }
          }
          $this->logger()->success('Successfully updated YAML files at ' . $path);
          $success = TRUE;
          break;

        // Unsuccessful operation yielding output beginning with "warning".
        case preg_match('/^warning:.*$/m', $output):
          $this->logger()->error('Failed to update YAML files at ' . $path);
          $this->logger()->warning($output);
          $this->rollBack($path);
          break;

        default:
          $this->logger()->error('Failed to update YAML files at ' . $path);
          $this->rollBack($path);
          break;
      }
    }
    // Restore current database.
    $this->io()->writeln(PHP_EOL . ' // Restoring snapshot of current database...' . PHP_EOL);
    exec('zcat ../webspark-db-snapshot' . $now . '.sql.gz | mysql -uroot -proot db');

    // Clean up.
    unlink('../webspark-db-snapshot' . $now . '.sql.gz');
    unlink('../webspark-db-backup.sql.gz');
    // Turn off output buffering.
    ob_end_clean();
    if ($success) {
      $this->logger()->notice('Please run `git status` to review changes. Commit and push the changes if desired.');
    }
  }

  /**
   * Roll back to previous YAML files.
   *
   * @param string $path
   *   The path to the YAML files.
   */
  private function rollBack($path): void {
    $this->logger()->notice('Rolling back YAML files to original state.');
    $restore_output = var_dump(shell_exec('git restore --source=HEAD --staged --worktree -- ' . $path . ' 2>&1'));
    if (empty($restore_output)) {
      $this->logger()->notice('YAML files were successfully restored at ' . $path);
    }
    else {
      $this->logger()->error('Failed to restore YAML files at ' . $path);
    }
  }

}
