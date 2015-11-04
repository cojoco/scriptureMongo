var myApp = angular.module('myApp',[]);

myApp.controller('TodosController', ['$scope', '$http', function($scope, $http) {
    $scope.todos = [];
    $scope.userName = "";
    $scope.todoItem = "";
    $scope.buttonText = "";
    $scope.disableButton = true;
    $scope.disableAddButton = true;
    $scope.userNameText = "";
    $scope.resultText = "Search for a user to see todo items.";
    $scope.addButtonText = "Add a todo item";
    
    $scope.getButtonText = function() {
        if ($scope.userName != "") {
            $scope.buttonText = "Get " + $("#Name").val() + "'s Todo Items";
            $scope.disableButton = false;
        } else {
            $scope.buttonText = "Please type in a user in the Name field";
            $scope.disableButton = true;
        }
        
        if ($scope.todoItem == "") {
            $scope.addButtonText = "Add a todo item";
            $scope.disableAddButton = true;
        } else {
            $scope.addButtonText = "Add a Todo for " + $("#Name").val();
            $scope.disableAddButton = false;
        }
        
    }
    
    $scope.postTodo = function() {
        var myobj = {"Name" : $("#Name").val(), "Todo" : $("#Todo").val()};
        var jobj = JSON.stringify(myobj);
        $http.post("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3005/todo", jobj, {headers: { 'Content-Type' : "application/x-www-form-urlencoded"}})
        .then(function(data) {
          $scope.getUsersTodo();
        }, function(data, status) {
            console.log(data);
            console.log(status);
        });
    }; 
    
    $scope.getUsersTodo = function() {
        $scope.userNameText = $("#Name").val() + "'s Todo Items";
        var url = "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3005/todo?Name=" + $("#Name").val();
        $scope.removeAll();
        $http.get(url).success(function(data) {
            data.forEach(function(item) {
                $scope.addTodo(item.Name, item.Todo);
            });
            if ($scope.todos.length == 0) {
                $scope.resultText = "No results found for the user";
            } else {
                $scope.resultText = "";
            }
        });
    };
    
    $scope.addTodo = function(addName, addTodo) {
        $scope.todos.push({Name:addName, Todo:addTodo});
    };

    $scope.removeTodo = function(index) {
        $scope.todos.splice(index, 1);
    };
    
    $scope.removeAll = function() {
        $scope.todos.splice(0, $scope.todos.length);
    };
}]);