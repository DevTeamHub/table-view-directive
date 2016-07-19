/**
* Angularjs Table View Directive
* https://github.com/DevTeamHub/table-view-directive
* (c) 2016 Dev Team Inc. http://dev-team.com
* License: MIT
*/

var tableViewModule = angular.module('dev-team-table-view', []);

tableViewModule.directive("dtTableView", dtTableViewDirective)
			   .directive("dtActionButtons", dtActionButtonsDirective);

function dtTableViewController($scope, $q) {

    $scope.skip = 0;
    $scope.take = 20;
    this.scope = $scope;

    if (!$scope.currentPage) {
        $scope.currentPage = 1;
    }
    $scope.searchString = "";

    this.filter = function (searchString, page) {
        if (searchString) page = 1;
        $scope.search({ skip: $scope.take * (page - 1), take: $scope.take, searchString: searchString })
        .then(function (data) {
            $scope.count = data.Count;
            $scope.list = data.List;
        });
    };

    this.search = function (searchString) {
        this.filter(searchString, $scope.currentPage);
    };

    this.changePage = function (page) {
        $scope.currentPage = page;
        this.filter($scope.searchString, page);
    };

    this.add = function (model) {
        return $scope.add({ model: model })
    	.then(function () {
    	    $scope.push ? $scope.list.push(model) : $scope.list.unshift(model);
    	});
    };

    this.update = function (copy) {
        return $scope.update({ model: copy });
    };

    this.remove = function (model) {
        return $scope.remove({ model: model })
    	.then(function () {
    	    var index = $scope.list.indexOf(model);
    	    $scope.list.splice(index, 1);
    	});
    };

    this.init = function (model) {
        var promise = $scope.initPopup({ model: model });
        if (!promise) promise = $q.when();
        return promise;
    };
}

function dtTableViewDirective() {
    return {
        scope: {
            list: "=",
            count: "=",
            search: "&",
            add: "&",
            update: "&",
            remove: "&",
            initPopup: "&",
            addTemplate: "@",
            updateTemplate: "@",
            removeMessage: "@",
            push: "@",
            currentPage: "=?"
        },
        restrict: "E",
        replace: true,
        transclude: true,
        templateUrl: templateSelector,
        controller: ['$scope', '$q', dtTableViewController],
        controllerAs: "ctrl",
        link: function (scope, element, attrs) {

            scope.canAdd = !!attrs["add"];
            scope.canUpdate = !!attrs["update"];
            scope.canRemove = !!attrs["remove"];
            scope.canSearch = !!attrs["search"];
            if (!scope.list) {
                throw new Error("You should setup start values for list");
            }
            if (scope.canAdd && !scope.addTemplate) {
                throw new Error("Cannot find add template");
            }
            if (scope.canUpdate && !scope.updateTemplate) {
                throw new Error("Cannot find update template");
            }
        }
    };

    function templateSelector(element, attrs) {
        if (attrs.templateUrl) {
            return attrs.templateUrl;
        }
        return "dt-table-view.tmpl.html";
    }
}

function dtActionButtonsController($scope) {

    this.update = function (model) {
        return $scope.viewCtrl.update(model);
    };

    this.remove = function (model) {
        return $scope.viewCtrl.remove($scope.item);
    };

    this.init = function (model) {
        return $scope.viewCtrl.init(model);
    };
}

function dtActionButtonsDirective() {
    return {
        scope: {
            item: "=dtActionButtons",
            canUpdate: "=?",
            canRemove: "=?"
        },
        restrict: 'A',
        require: "^dtTableView",
        templateUrl: templateSelector,
        controller: ['$scope', dtActionButtonsController],
        controllerAs: "ctrl",
        link: function (scope, element, attrs, viewCtrl) {

            scope.viewCtrl = viewCtrl;
            scope.updateTemplate = viewCtrl.scope.updateTemplate;
            scope.removeMessage = viewCtrl.scope.removeMessage;
            if (scope.canUpdate == undefined) scope.canUpdate = true;
            if (scope.canRemove == undefined) scope.canRemove = true;
            if (!viewCtrl.scope.removeMessage) {
                scope.removeMessage = "Are you sure that you want to remove this item?";
            }
        }
    };

    function templateSelector(element, attrs) {
        if (attrs.templateUrl) {
            return attrs.templateUrl;
        }
        return "dt-action-buttons.tmpl.html";
    }
}

tableViewModule.run(["$templateCache", function ($templateCache) {
    $templateCache.put("dt-action-buttons.tmpl.html",
	"<span><dt-popup-link ng-if=\"viewCtrl.scope.canUpdate && canUpdate\" class=\"btn link-button glyphicon glyphicon-edit\"ng-model=\"item\"init-action=\"ctrl.init(model)\"save-action=\"ctrl.update(model)\"url=\"updateTemplate\"><\/dt-popup-link><dt-confirm-link ng-if=\"viewCtrl.scope.canRemove && canRemove\" class=\"btn link-button glyphicon glyphicon-remove\"confirm-action=\"ctrl.remove(model)\"message=\"{{removeMessage}}\"><\/dt-confirm-link><\/span>");
    $templateCache.put("dt-table-view.tmpl.html",
	"<div class=\"ibox-content\"><div class=\"row search-container\"><div class=\"col-xs-6\" ng-if=\"canSearch\"><dt-search search-string=\"searchString\" search=\"ctrl.search(searchString)\"><\/dt-search><\/div><div class=\"col-xs-6\" ng-class=\"{'pull-right': canSearch}\" ng-if=\"canAdd\"><dt-popup-link class=\"btn btn-sm btn-primary add-new-item-btn\" url=\"addTemplate\" save-action=\"ctrl.add(model)\" init-action=\"ctrl.init(model)\" title=\"Добавить\"><\/dt-popup-link><\/div><\/div><br \/><div ng-transclude><\/div><dt-pagination ng-if=\"canSearch\" num-pages=\"count\" max-pages=\"5\" current-page=\"currentPage\" on-select-page=\"ctrl.changePage(page)\"><\/dt-pagination><\/div>");
}]);