##Localization and Server Configuration

This applicationis an express/node api written in typescript. The API currently supports option parameters for MongoDB and Postgres. The API will look in the models directory and index.ts file for the models. If the corresponding table does not exist in the database, it will create it according to the schema provided. for example:



1. someUser@ubuntu> sudo apt-get update `get package updates`

## Using dpkg-reconfigure
1. someUser@ubuntu> date `will output the date time stamp` 
2. someUser@ubuntu> sudo dpkg-reconfigure tzdata `will launch the time zone selection interface`

## Using tzselect
1. someUser@ubuntu> tzselect
2. someUser@ubuntu> 2 `select Americas`
3. someUser@ubuntu> 49 `select United States`
4. someUser@ubuntu> 2 `select Pacific`
5. someUser@ubuntu> 1 `select Yes`

1. someUser@ubuntu> export TZ="America/Los_Angeles"
2. someUser@ubuntu> set | grep TZ

## Using timedatectl
1. someUser@ubuntu> timedatectl `will output local and universal time information`
2. someUser@ubuntu> timedatectl list-timezones `will list all timezones`
3. someUser@ubuntu> timedatectl set-timezone "<the desired timezone form step 2>"
