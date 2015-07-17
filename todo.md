- Add $log to services
	- REF_1
- Reassess approach to exception handling
- Add more testing

- uistate vs new-router
	- new-router
		- component based (one folder for controller and template)
		- 

-ngMessages for errors https://docs.angularjs.org/api/ngMessages/directive/ngMessages

- angulartics

- http://angular-ui.github.io/ui-tour/demo/demo.html vs http://daftmonk.github.io/angular-tour/

- multi-lingual support


REF_1:
	var logSuccess = function (name, response) {
	    $log.info('*** DEBUG *** %s: Success: response=%o', name, response);
	  };
	
	  var logError = function(name, response) {
	    $log.error('%s: Error: response=%o', name, response);
	  };