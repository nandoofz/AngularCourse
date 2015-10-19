var app = angular.module('codecraft', [
	'ngResource',
	'infinite-scroll'
]);

app.config(function ($httpProvider, $resourceProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token 17c142ef60041a2d0c41a2f73cd9a09201896560';
	$resourceProvider.defaults.stripTrailingSlashes = false;
});

app.controller('PersonDetailController', function ($scope, ContactService) {
	$scope.contacts = ContactService;
});

app.factory('Contact', function ($resource) {
	return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/");
});

app.controller('PersonListController', function ($scope, ContactService) {

	$scope.search = "";
	$scope.order = "email";
	$scope.contacts = ContactService;

	$scope.loadMore = function () {
		console.log("Load More!!!");
		$scope.contacts.loadMore();
	};

	$scope.$watch('search', function(newVal, oldVal){
		console.log(newVal);
	});

});

app.service('ContactService', function (Contact) {

	var self = {
		'addPerson': function (person) {
			this.persons.push(person);
		},
		'page': 1,
		'hasMore': true,
		'isLoading': false,
		'selectedPerson': null,
		'persons': [],
		'loadContacts': function(){
			if(self.hasMore && !self.isLoading){
				self.isLoading = true;

				var params = {
					'page': self.page
				};

				Contact.get(params, function(data){
					console.log(data);
					angular.forEach(data.results, function(person) {
						self.persons.push(new Contact(person));
					});

					if(!data.next){
						self.hasMore = false;
					}

					self.isLoading = false;
				});
			}
		},
		'loadMore': function(){
			if(self.hasMore && !self.isLoading){
				self.page += 1;
				self.loadContacts();
			}
		}
	};

	self.loadContacts();

	return self;
});