var myApp = angular.module('myApp',[]);

myApp.controller('TodosController', ['$scope', '$http', function($scope, $http) {
    $scope.todos = [];
    
    $http.get("http://localhost:3000/todo").success(function(data) {
        data.forEach(function(item) {
            $scope.addTodo(item.Name, item.Todo);
        });
    });
    
    $scope.postTodo = function() {
        var myobj = {"Name" : $("#Name").val(), "Todo" : $("#Todo").val()};
        var jobj = JSON.stringify(myobj);
        $("#json").text(jobj);
        $http.post("http://localhost:3000/todo", jobj, {headers: { 'Content-Type' : "application/x-www-form-urlencoded"}})
        .then(function(data) {
          $scope.addTodo(myobj.Name, myobj.Todo);
        }, function(data, status) {
            console.log(data);
            console.log(status);
        });
    };
    
    $scope.getUsersTodo = function() {
        var url = "http://localhost:3000/todo?Name=" + $("#Name").val();
        $http.get(url).success(function(data) {
            $scope.todos = [];
            data.forEach(function(item) {
                $scope.addTodo(item.Name, item.Todo);
            });
        });
    };
    
    $scope.addTodo = function(addName, addTodo) {
        $scope.todos.push({name:addName, todo:addTodo});
    };

    $scope.removeTodo = function(index) {
        $scope.todos.splice(index, 1);
    };
}]);