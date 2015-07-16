angular.module('app.config', [])

.constant('apiUrl', 'http://localhost:5000')

.constant('marketplaceUrl', 'http://localhost:8000')

.constant('searchUrl', 'http://localhost:9200')

.constant('apiKey', '77dc92d4-2368-498b-a8a2-cb359e637f5b')

.constant('apiSecret', '571c91e3c18b45178df98a32')

.constant('TemplatePaths', {marketplace:'marketplace',shared:'shared'})

.constant('membershipTypes', [{id:'team',name:'Team Member'},{id:'manager',name:'Manager'},{id:'executive',name:'Executive'},{id:'master',name:'Master'}])

.constant('defaultPaginationOptions', {currentPage:1,totalItems:1,maxSize:5,itemsPerPage:20})

;