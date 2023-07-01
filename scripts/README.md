
Steps to install this code validation tool in your local : 

1) The 'pre-commit' file, located in the 'scripts/' directory, should be relocated to the './.git/hooks/' directory.
Run the following command to make the hook executable:
chmod +x .git/hooks/pre-commit

2) Please, ensure that PHP version 8.2.6 is installed on your system.

3) As last step, you have to run the next command:
```
composer install
```
Steps to use this tool: 

1) Once you finish your implementation(code changes), please move your files to the staging area.
2) When you commit your files, you may encounter errors if there are issues in your staged files. Also, you can run this validation **manually** by executing : ./.git/hooks/pre-commit (Files that needs to be evaluated must be in the staging area).
3) Please fix the errors and commit your changes again.
