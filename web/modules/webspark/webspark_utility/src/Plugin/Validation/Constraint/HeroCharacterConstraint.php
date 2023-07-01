<?php

namespace Drupal\webspark_utility\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Checks that the submitted value is a unique integer.
 *
 * @Constraint(
 *   id = "HeroCharacterConstraint",
 *   label = @Translation("Hero Character Constraint", context = "Validation"),
 *   type = "string"
 * )
 */
class HeroCharacterConstraint extends Constraint {

  // The message that will be shown if the value is too many characters.
  public $tooLong = 'Hero Text has too many characters. The maximum character limit is 300. You have entered %length characters. Please remove %remove characters.';

}
