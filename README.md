# ngKinvey

[![Build Status](https://travis-ci.org/ninjatronic/ngKinvey.png)](https://travis-ci.org/ninjatronic/ngKinvey)

**ngKinvey** aims to provide easy-to-consume support for BaaS services provided by [Kinvey](http://kinvey.com/).
This API allows an AngularJS app to interact with its backend on Kinvey programatically using the `$resource` and
`$q` paradigms provided by Angular.

## Dependencies

* [AngularJS 1.2.0-rc.3 or later](https://github.com/angular/bower-angular)
* [ngResource 1.2.0-rc.3 or later](https://github.com/angular/bower-angular-resource)
* [ngCookies 1.2.0-rc.3 or later](https://github.com/angular/bower-angular-cookies)
* [ngBase64](https://github.com/ninjatronic/ngBase64)

## Usage

* [Getting Started](https://github.com/ninjatronic/ngKinvey/wiki/Getting-Started)
* [Data Store](https://github.com/ninjatronic/ngKinvey/wiki/Data-Store)

This documentation mirrors the structure of the [Kinvey DevCenter REST API guide](http://devcenter.kinvey.com/rest/guides/), 
and large parts of this documentation have been copied verbatim and then altered.


## Development

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
