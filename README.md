# ![Jiraffix Logo][logo] Jiraffix

Jira Forge App to fix annoying signatures in Jira.

## Overview

I made this to remove all the annoying email signatures in Jira.

See Jira ticket [JSDCLOUD-5878](https://jira.atlassian.com/browse/JSDCLOUD-5878)

It's a simple app, it checks if a regex matches the text in tables.
If there is a match, the entire table is dropped.

My original plan was to write a node.js app for this, but Jira has this new Forge thing out in beta, and I used that.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Install Jiraffix to your Jira instance

- Download the project
- `git pull https://github.com/hvgab/jiraffix`
- `cd jiraffix`
- Install requirements
- `nvm install --lts=erbium`
- `nvm use --lts=erbium`
- `npm install forge`
- Run Forge commands to install it to your Jira instance.
- `forge login`
- `forge install`
- `forge deploy`

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Modify your app by editing the `src/index.jsx` file.

- Build and deploy your app by running:

```
forge deploy
```

- Install your app in an Atlassian site by running:

```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:

```
forge tunnel
```

### Notes

- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

## Attributions

Giraffe by Sumana Chamrunworakiat from the Noun Project

[logo]: noun_Giraffe_578562-64px.png
