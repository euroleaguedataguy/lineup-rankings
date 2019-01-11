var app = angular.module('plunker', ['ngTagsInput','ui.bootstrap','ui.grid', 'ui.grid.pagination', 'ui.bootstrap']);

function findLineupWidth(lineup){
   var length = lineup.replace(/[^|]/g, "").length;
   return length*80+200;
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index == 0 ? letter.toUpperCase() :  letter.toLowerCase();
    }).replace(/\s+/g, '');
}

app.controller('MainCtrl', function($scope, $http, $log, uiGridConstants) {

    $scope.rounds = ["AllRounds"];
    $scope.sizes = [1,2,3,4,5];

    for (i = 1; i <= 18; i++) {
        $scope.rounds.push("Round"+i);
    }

    $scope.selectedRound = $scope.rounds[0];
    $scope.textForButton = "All teams";
    $scope.textForButton2 = 5;

    $scope.gridOptions = {
        paginationPageSize: 10,
        enablePaginationControls: false,
        enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
        enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER
    };

    refreshData();

    function refreshData(){
        $http.get('data/'+$scope.selectedRound+'_players'+$scope.textForButton2+'.json', {cache: true}).then(function (response) {
            var dataToShow = (response.data);
            if($scope.textForButton!="All teams"){
               dataToShow = dataToShow.filter(function (entry) {
                    //console.log(entry["TEAM"]==$scope.textForButton);
                   return entry["TEAM"]==$scope.textForButton;
                });
            }
            for(var tag in $scope.tags){
                dataToShow = dataToShow.filter(function (entry) {
                    //console.log(entry["TEAM"]==$scope.textForButton);
                    return entry["LINEUP"].toLowerCase().indexOf($scope.tags[tag].text.toLowerCase()) != -1;
                });
            }

            $scope.gridOptions.data = dataToShow;
            $scope.importantCrucialData = dataToShow;
            var columnDefs = [];
            columnDefs.push({"field":"TEAM","width":300});
            var width = findLineupWidth(response.data[0]["LINEUP"]);
            columnDefs.push({"field":"LINEUP","width":width,cellFilter: 'lineupFilter'});
            columnDefs.push({"field":"+/-","width":100,cellFilter: 'fractionFilter'});
            columnDefs.push({"field":"MINS","width":100});
            columnDefs.push({"field":"SCORE","width":100});

            // for(var key in keys){
            //     if(isNaN(response.data[0][keys[key]])){
            //         if(keys[key]=="TEAM"){
            //
            //         } else if (keys[key]=="SCORE"){
            //
            //         } else if (keys[key]=="LINEUP") {
            //
            //         }
            //     } else {
            //         if(keys[key]=="+/-"){
            //
            //         } else {
            //
            //         }
            //
            //     }
            //
            // }
            console.log(columnDefs);
            $scope.gridOptions.columnDefs = columnDefs;
        });
    }


    $scope.tags = [];

    $scope.items = [];

    $http.get('data/playersPerTeam.json', {cache: true}).then(function (response) {
        var teams = response.data;
        var toRet = ["All teams"];
        for(var team in teams){
            toRet.push(team);
        }
        $scope.items = toRet;
    });

    $scope.tagChanged = function(tag) {
        refreshData();
    };


    $scope.change = function(name){
        $scope.textForButton = name;
        $scope.tags = [];
        $scope.gridOptions.paginationCurrentPage=1;
        refreshData();
    }

    $scope.changeSize = function(name){
        $scope.textForButton2 = name;
        $scope.tags = [];
        $scope.gridOptions.paginationCurrentPage=1;
        refreshData();
    }

    $scope.changeRound = function(name){
        $scope.selectedRound = name;
        $scope.tags = [];
        $scope.gridOptions.paginationCurrentPage=1;
        refreshData();
    }

    $scope.loadCountries = function($query) {
        return $http.get('data/playersPerTeam.json', { cache: true}).then(function(response) {
            if($scope.tags.length==$scope.textForButton2){
                return [];
            }
            var teams = response.data;
            var players = [];
            if($scope.textForButton!="All teams"){
                for(var player in teams[$scope.textForButton]){
                    players.push(teams[$scope.textForButton][player]);
                }
            }

            return players.filter(function(country) {
                return country.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        });
    };
})
    .filter('fractionFilter', function () {
        return function (value) {
           return (value<0?"":"+") + value;
        };
    })
    .filter('lineupFilter', function () {
        return function (value) {
            var res = value.split("|");
            var entries = [];
            for(var names in res){
                var fullName = (res[names].trim()).split(",");
                entries.push(camelize(fullName[0]));
            }
            return entries.join(" | ");
        };
    });
