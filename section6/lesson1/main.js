var app = angular.module('codecraft', [
	'ngResource',
	'infinite-scroll',
	'angularSpinner',
	'jcs-autoValidate',
	'angular-ladda',
	'mgcrea.ngStrap'
]);

app.config(function ($httpProvider, $resourceProvider, laddaProvider) {
	$httpProvider.defaults.headers.common['Authorization'] = 'Token 17c142ef60041a2d0c41a2f73cd9a09201896560';
	$resourceProvider.defaults.stripTrailingSlashes = false;
	laddaProvider.setOption({
		style: 'expand-right'
	});
});

app.controller('PersonDetailController', function ($scope, ContactService) {
	$scope.contacts = ContactService;

	$scope.save = function(){
		$scope.contacts.updateContact($scope.contacts.selectedPerson);
	};

	$scope.remove = function(){
		$scope.contacts.removeContact($scope.contacts.selectedPerson);
	};
});

app.factory('Contact', function ($resource) {
	return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/", {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});

app.controller('PersonListController', function ($scope, $modal, ContactService) {

	$scope.search = "";
	$scope.order = "email";
	$scope.contacts = ContactService;

	$scope.loadMore = function () {
		$scope.contacts.loadMore();
	};

	$scope.createModal = function () {
		$scope.contacts.loadMore();
	};

	$scope.$watch('search', function(newVal, oldVal){
		if(angular.isDefined(newVal)){
			$scope.contacts.doSearch(newVal);
		}
	});

	$scope.$watch('order', function(newVal, oldVal){
		$scope.createModal = $modal({
			scope: $scope,
			template: 'templates/modal.create.tpl.html',
			show: true
		});
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
		'isSaving': false,
		'selectedPerson': null,
		'persons': [],
		'search': null,
		'ordering': null,
		'doSearch': function(search){
			self.hasMore = true;
			self.page = 1;
			self.persons = [];
			self.search = search;
			self.loadContacts();
		},
		'doOrder': function(order){
			self.hasMore = true;
			self.page = 1;
			self.persons = [];
			self.ordering = order;
			self.loadContacts();
		},
		'loadContacts': function(){
			if(self.hasMore && !self.isLoading){
				self.isLoading = true;

				var params = {
					'page': self.page,
					'search': self.search,
					'ordering': self.ordering
				};

				Contact.get(params, function(data){
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
		},
		'updateContact': function (person){
			self.isSaving = true;
			person.$update().then(function (){
				self.isSaving = false;
			});
		},
		'removeContact': function (person){
			self.isDeleting = true;
			person.$remove().then(function (){
				self.isDeleting = false;
				var index = self.persons.indexOf(person);
				self.persons.splice(index, 1);
				self.selectedPerson = null;
			});
		}
	};

	self.loadContacts();

	return self;
});