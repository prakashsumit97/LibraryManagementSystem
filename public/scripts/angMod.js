/**
 * Created by karthick on 01/09/16.
 */

angular.module('routeService', ['ngResource']).factory('route', function ($resource) {
    return $resource('/:entity/:id/:action/:status/:process', {
        entity: '@entity',
        id: '@id',
        action: '@action',
        status: '@status',
        process: '@process'
    }, {
        post: {
            method: 'POST',
            params: {}
        },
        list: {
            method: 'GET',
            params: {},
            isArray: true
        },
        get: {
            method: 'GET',
            params: {}
        },
        update: {
            method: 'PUT',
            params: {}
        },
        delete: {
            method: 'DELETE',
            params: {}
        }

    });
});

var libraryApp = angular.module('libraryApp', ['routeService', 'localytics.directives', 'ui.bootstrap', 'ui.router', 'objectTable']);

function LibraryRouteConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/', '/login').otherwise('/');

    var fileDir = "../pages/";

    $stateProvider.state('menu', {
        url: '/menu',
        controller: MenuCtrl,
        templateUrl: fileDir + 'general/menu.html',
        resolve: {
            userDetail: GetPreLoginUser
        }
    }).state('login', {
        url: '/login',
        controller: LoginCtrl,
        templateUrl: fileDir + 'general/login.html'
    }).state('menu.users', {
        url: '^/users',
        controller: UserListCtrl,
        templateUrl: fileDir + 'user/users.html'
    }).state('menu.user', {
        url: '^/user_create',
        controller: UserCtrl,
        templateUrl: fileDir + 'user/user.html'
    }).state('menu.editUser', {
        url: '^/user/:id/edit',
        controller: UserEditCtrl,
        templateUrl: fileDir + 'user/user.html'
    }).state('menu.books', {
        url: '^/books',
        controller: BookListCtrl,
        templateUrl: fileDir + 'book/books.html'
    }).state('menu.book', {
        url: '^/book_create',
        controller: BookCtrl,
        templateUrl: fileDir + 'book/book.html'
    }).state('menu.editBook', {
        url: '^/book/:id/edit',
        controller: BookEditCtrl,
        templateUrl: fileDir + 'book/book.html'
    }).state('menu.transactions', {
        url: '^/transactions',
        controller: TransactionListCtrl,
        templateUrl: fileDir + 'transaction/transactions.html'
    }).state('menu.transaction', {
        url: '^/transaction_create',
        controller: TransactionCtrl,
        templateUrl: fileDir + 'transaction/transaction.html'
    });
}

libraryApp.config(LibraryRouteConfig);

function GetPreLoginUser($q, $state, route) {

    var deferred = $q.defer();
    route.get({
        entity: "loggedInUser"
    }, function (success) {
        deferred.resolve(success);
    }, function (error) {
        switch (error.status) {
            case 401 || 404:
                deferred.reject("Not found");
                alert("Session is expired. Please login to continue");
                $state.go("login")
        }
    });
    return deferred.promise;
}

function MenuCtrl($scope, $state, route, userDetail) {
    $scope.userInfo = userDetail;
    $scope.menuCtrlObj = {
        currentState: "users"
    };
    $scope.logout = function () {

        route.save({
            entity: "logout"
        }, function (response) {
            console.log(response);
            $state.go('login')
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    }
}

function LoginCtrl($scope, $state, route) {

    $scope.login = function (user) {

        route.save({
            entity: "authenticate"
        }, user, function (response) {
            $state.go('menu.users')
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    }
}

function UserListCtrl($scope, route, $state) {

    $scope.$parent.menuCtrlObj.currentState = 'users';

    $scope.ctrlObj = {
        role: 'ADMIN'
    };

    var GetUsers = function (role) {
        route.list({
            entity: "users",
            id: role
        }, function (response) {

            $scope.users = response;
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetUsers($scope.ctrlObj.role);

    $scope.roleChange = function () {
        GetUsers($scope.ctrlObj.role);
    };

    $scope.editUser = function (item) {
        $state.go("menu.editUser", {
            id: item._id
        })
    };
    $scope.changeStatus = function (item, status) {
        route.update({
            entity: "user",
            id: item._id,
            action: 'statusChange',
            status: status
        }, function (response) {
            GetUsers($scope.ctrlObj.role)
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    }
}

function UserCtrl($scope, route, $state, $stateParams) {

    $scope.user = {
        role: 'ADMIN'
    };

    $scope.userSave = function () {
        route.save({
            entity: "user"
        }, $scope.user, function (response) {
            console.log(response);
            $state.go('menu.users')
        }, function (error) {
            console.log(error)
            switch (error.status) {
                case 400:
                    $scope.error = error.data;
                    break;
                case 401:
                    alert(error.data.unAuthMsg);
                    $state.go('login');
                    break;
                case 500:
                    alert("Internal server error. Please try again later.");
                    break;
            }
        });
    };
}

function UserEditCtrl($stateParams, $scope, route, $state) {

    $scope.editFlag = true;
    var GetUsers = function () {
        route.get({
            entity: "user",
            id: $stateParams.id
        }, function (response) {
            $scope.user = response;
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetUsers();

    $scope.userUpdate = function (user) {

        route.update({
            entity: "user",
            id: user._id
        }, $scope.user, function (response) {
            console.log(response);
            $state.go('menu.users')
        }, function (error) {
            switch (error.status) {
                case 400:
                    $scope.error = error.data
                    break;
                case 401:
                    alert(error.data.unAuthMsg);
                    $state.go('login');
                    break;
                case 500:
                    alert("Internal server error. Please try again later.");
                    break;
            }
        });
    }
}

function BookListCtrl($scope, route, $state) {

    $scope.$parent.menuCtrlObj.currentState = 'books';

    var GetBooks = function () {
        route.list({
            entity: "books"
        }, function (response) {
            $scope.books = response;
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetBooks();

    $scope.editBook = function (item) {
        $state.go("menu.editBook", {
            id: item._id
        })
    };
    $scope.changeStatus = function (item, status) {
        route.update({
            entity: "book",
            id: item._id,
            action: 'statusChange',
            status: status
        }, function (response) {
            GetBooks()
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    }

}

function BookCtrl($scope, route, $state, $stateParams) {

    $scope.bookSave = function () {
        route.save({
            entity: "book"
        }, $scope.book, function (response) {
            console.log(response);
            $state.go('menu.books')
        }, function (error) {
            console.log(error)
        });
    };
}

function BookEditCtrl($stateParams, $scope, route, $state) {

    $scope.editFlag = true;
    var GetBook = function () {
        route.get({
            entity: "book",
            id: $stateParams.id
        }, function (response) {
            $scope.book = response;
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetBook();

    $scope.bookUpdate = function (book) {

        route.update({
            entity: "book",
            id: book._id
        }, $scope.book, function (response) {
            console.log(response);
            $state.go('menu.books')
        }, function (error) {
            switch (error.status) {
                case 400:
                    $scope.error = error.data;
                    break;
                case 401:
                    alert(error.data.unAuthMsg);
                    $state.go('login');
                    break;
                case 500:
                    alert("Internal server error. Please try again later.");
                    break;
            }
        });
    }
}

function TransactionListCtrl($scope, route, $state) {

    $scope.$parent.menuCtrlObj.currentState = 'transactions';


    var GetTransactions = function () {
        route.list({
            entity: "transactions"
        }, function (response) {
            $scope.transactions = response;
            console.log(response)
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetTransactions();

    $scope.changeStatus = function (item) {
        route.update({
            entity: "transaction",
            id: item._id,
            action: 'changeStatus'
        }, function (response) {
            console.log(response)
            GetTransactions()
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    }

}

function TransactionCtrl($scope, route, $state, $stateParams) {

    $scope.transaction = {
        issueDate: new Date
    };

    $scope.issueOptions = {
        minDate: new Date
    };

    var GetUsers = function () {
        route.list({
            entity: "users",
            id: "NORMAL",
            action: 'active'
        }, function (response) {

            $scope.users = response;
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetUsers();

    var GetBooks = function () {
        route.list({
            entity: "activeBook"
        }, function (response) {
            $scope.books = response;
        }, function (error) {
            ErrorHandling1(error, $state)
        });
    };
    GetBooks();

    $scope.transactionSave = function (transaction) {

        route.save({
            entity: "transaction"
        }, transaction, function (response) {
            console.log(response);
            $state.go('menu.transactions')
        }, function (error) {
            switch (error.status) {
                case 400:
                    $scope.error = error.data;
                    break;
                case 401:
                    alert(error.data.unAuthMsg);
                    $state.go('login');
                    break;
                case 500:
                    alert("Internal server error. Please try again later.");
                    break;
            }
        });
    };

}

var ErrorHandling1 = function (error, $state) {
    switch (error.status) {
        case 400:
            alert(error.data.error);
            break;
        case 401:
            alert(error.data.unAuthMsg);
            $state.go('login');
            break;
        case 500:
            alert("Internal server error. Please try again later.");
            break;
    }
};
