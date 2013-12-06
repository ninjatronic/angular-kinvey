# angular-kinvey

[![Build Status](https://travis-ci.org/ninjatronic/angular-kinvey.png)](https://travis-ci.org/ninjatronic/angular-kinvey)

**angular-kinvey** aims to provide easy-to-consume support for BaaS services provided by [Kinvey](http://kinvey.com/).
This API allows an AngularJS app to interact with its backend on Kinvey programatically using the `$resource` 
paradigm provided by Angular.

## Mandatory Dependencies

* [AngularJS 1.2.0-rc.3 or later](https://github.com/angular/bower-angular)
* [ngResource 1.2.0-rc.3 or later](https://github.com/angular/bower-angular-resource)
* [ngBase64](https://github.com/ninjatronic/ngBase64)

## Optional Dependencies

* [ngCookies 1.2.0-rc.3 or later](https://github.com/angular/bower-angular-cookies)
* [ngStorage 0.3.0 or later](https://github.com/gsklee/ngStorage)

## Usage

* [Getting Started](https://github.com/ninjatronic/angular-kinvey/wiki/Getting-Started)
* [Data Store](https://github.com/ninjatronic/angular-kinvey/wiki/Data-Store)
* [Users](https://github.com/ninjatronic/angular-kinvey/wiki/Users)
* [Location] (https://github.com/ninjatronic/angular-kinvey/wiki/Location)
* [Business Logic] (https://github.com/ninjatronic/angular-kinvey/wiki/Business-Logic)
* [Files] (https://github.com/ninjatronic/angular-kinvey/wiki/Files)

This documentation mirrors the structure of the [Kinvey DevCenter REST API guide](http://devcenter.kinvey.com/rest/guides/), 
and large parts of this documentation have been copied verbatim and then altered.

## Support The Project

If you have found this project useful you can encourage the developers by...

* [Voting for us on ngModules](http://ngmodules.org/modules/angular-kinvey)
* [Liking us on Facebook](https://www.facebook.com/ninjatronic)
* [Flattring us](https://flattr.com/submit/auto?user_id=ninjatronic&url=https://github.com/ninjatronic/angular-kinvey/&title=angular-kinvey&language=&tags=github&category=software)
* **[Making a Donation](https://pledgie.com/campaigns/23204)**

## Contribution

Contributions are welcome on this project.

* If you think there is something missing or have discovered a bug please [open an issue](https://github.com/ninjatronic/angular-kinvey/issues/new)
* If you want to submit code to the project, please [fork the repo](https://github.com/ninjatronic/angular-kinvey/fork) and submit a pull request

You can check the [project milestones](https://github.com/ninjatronic/angular-kinvey/issues/milestones?with_issues=yes) for an
idea of the development roadmap.

### Tooling for Development

This project uses Grunt for tooling. The toolbelt dependencies are managed by NPM and the production  dependencies are
managed by Bower. To develop, fork this repo and clone the code, then...

```
npm install
bower install
```

Unit and scenario tests are run with `grunt test`. To run only unit tests use `grunt testUnit`. To build the minified
file and test it use `grunt build`. **Please replace the configuration options in the scenario tests with your own app
key and secret before running the tests.**

### Issues

Issues are welcome. Please consider writing unit and scenario tests to illustrate your issue.

### Pull Requests

Pull requests are welcome. Please include unit and scenario tests which illustrate the feature you are adding, or the
issue you are solving. Please also include a minified and tested version of the kinvey.js file (using `grunt build`).
