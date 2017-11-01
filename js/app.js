var myApp = angular.module("myApp", []);

/*myApp.config(['$routeProvider', function($routeProvider){
  $routeProvider.
  when('/home', {
    templateUrl: 'partials/home.html',
    controller: 'HomeController'
  }).
  when('/about', {
    templateUrl: 'partials/about.html',
    controller: 'AboutController'
  }).
  otherwise({
    redirectTo: '/home'
  });
}]);*/

myApp.run(function($rootScope) {
  $rootScope.support = { transitions: Modernizr.csstransitions };
  // transition end event name
  $rootScope.transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' };
  $rootScope.transEndEventName = $rootScope.transEndEventNames[ Modernizr.prefixed( 'transition' ) ];
  $rootScope.onEndTransition = function( el, callback ) {
    var onEndCallbackFn = function( e ) {
      if( $rootScope.support.transitions ) {
        el.removeEventListener( $rootScope.transEndEventName, onEndCallbackFn );
      }
      if( callback && typeof callback === 'function' ) { callback(); }
    };
    if( $rootScope.support.transitions ) {
      el.addEventListener( $rootScope.transEndEventName, onEndCallbackFn );
    }
    else {
      onEndCallbackFn(el, callback);
    }
  };
  $rootScope.onEndCallbackFn = function( el, callback ) {
    /*if( $rootScope.support.transitions ) {
      el.removeEventListener( $rootScope.transEndEventName, $rootScope.onEndCallbackFn );
    }*/
    if( callback && typeof callback === 'function' ) { callback(); }
  };
  // the pages wrapper
  $rootScope.stack = $('.pages-stack');
  // the page elements
  //$rootScope.pages = [].slice.call($rootScope.stack.children);
  $rootScope.pages = $('.pages-stack .page');
  // total number of page elements
  $rootScope.pagesTotal = $rootScope.pages.length;
  // index of current page
  $rootScope.current = 0;
  // menu button
  $rootScope.menuCtrl = $('button.menu-button');
  // the navigation wrapper
  $rootScope.nav = $('.pages-nav');
  // the menu nav items
  $rootScope.navItems = $('.pages-nav .link--page');
  // check if menu is open
  $rootScope.isMenuOpen = false;
  // flag for home page descrition
  $rootScope.needStop = false;

  $rootScope.toggleMenu = function() {
    //  $('#page-home').css('transform', 'translate3d(0,75%,10%)');
    if( $rootScope.isMenuOpen ) {
			$rootScope.closeMenu();
		}
		else {
			$rootScope.openMenu();
			$rootScope.isMenuOpen = true;
		}
  };

  $rootScope.buildStack = function() {
		var stackPagesIdxs = $rootScope.getStackPagesIdxs();

		// set z-index, opacity, initial transforms to pages and add class page--inactive to all except the current one
		for(var i = 0; i < $rootScope.pagesTotal; ++i) {
			var page = $rootScope.pages[i],
				posIdx = stackPagesIdxs.indexOf(i);

			if( $rootScope.current !== i ) {
        $(page).addClass('page--inactive');

				if( posIdx !== -1 ) {
					// visible pages in the stack
					page.style.WebkitTransform = 'translate3d(0,100%,0)';
					page.style.transform = 'translate3d(0,100%,0)';
				}
				else {
					// invisible pages in the stack
					page.style.WebkitTransform = 'translate3d(0,75%,-300px)';
					page.style.transform = 'translate3d(0,75%,-300px)';
				}
			}
			else {
        $(page).removeClass('page--inactive');
			}

			page.style.zIndex = i < $rootScope.current ? parseInt($rootScope.current - i) : parseInt($rootScope.pagesTotal + $rootScope.current - i);

			if( posIdx !== -1 ) {
				page.style.opacity = parseFloat(1 - 0.1 * posIdx);
			}
			else {
				page.style.opacity = 0;
			}
		}
	};

  // gets the current stack pages indexes. If any of them is the excludePage then this one is not part of the returned array
  $rootScope.getStackPagesIdxs = function(excludePageIdx) {
    var nextStackPageIdx = $rootScope.current + 1 < $rootScope.pagesTotal ? $rootScope.current + 1 : 0,
      nextStackPageIdx_2 = $rootScope.current + 2 < $rootScope.pagesTotal ? $rootScope.current + 2 : 1,
      idxs = [],

      excludeIdx = excludePageIdx || -1;

    if( excludePageIdx != $rootScope.current ) {
      idxs.push($rootScope.current);
    }
    if( excludePageIdx != nextStackPageIdx ) {
      idxs.push(nextStackPageIdx);
    }
    if( excludePageIdx != nextStackPageIdx_2 ) {
      idxs.push(nextStackPageIdx_2);
    }

    return idxs;
  };

  // opens the menu
	$rootScope.openMenu = function() {
		// toggle the menu button
    $($rootScope.menuCtrl).addClass('menu-button--open');
		// stack gets the class "pages-stack--open" to add the transitions
    $($rootScope.stack).addClass('pages-stack--open');
		// reveal the menu
    $($rootScope.nav).addClass('pages-nav--open');

		// now set the page transforms
		var stackPagesIdxs = $rootScope.getStackPagesIdxs();
		for(var i = 0, len = stackPagesIdxs.length; i < len; ++i) {
			var page = $rootScope.pages[stackPagesIdxs[i]];
			page.style.WebkitTransform = 'translate3d(0, 75%, ' + parseInt(-1 * 200 - 50*i) + 'px)'; // -200px, -230px, -260px
			page.style.transform = 'translate3d(0, 75%, ' + parseInt(-1 * 200 - 50*i) + 'px)';
      //$('#page-home').css("-webkit-transform","translate3d(0, 75%, ' + parseInt(-1 * 200 - 50*i) + 'px)");
      //$('#page-home').css("transform","translate3d(0, 75%, ' + parseInt(-1 * 200 - 50*i) + 'px)");
		}
	};

	// closes the menu
	$rootScope.closeMenu = function() {
		// same as opening the current page again
		$rootScope.openPage();
	};

	// opens a page
	$rootScope.openPage = function(id) {
		var futurePage = id ? document.getElementById(id) : $rootScope.pages[$rootScope.current],
			futureCurrent = Array.prototype.slice.call( $rootScope.pages ).indexOf(futurePage),
			stackPagesIdxs = $rootScope.getStackPagesIdxs(futureCurrent);
        if(id && id === 'page-home' && $rootScope.needStop) {
            $rootScope.needStop = false;
            $rootScope.$emit("CallDescriptionMethod", {});
        } else if(id !== 'page-home'){
            $rootScope.needStop = true;
        }

        if(id === 'page-projects') {
            $rootScope.$emit("CallProjectMethod", {});
        }

		// set transforms for the new current page
		futurePage.style.WebkitTransform = 'translate3d(0, 0, 0)';
		futurePage.style.transform = 'translate3d(0, 0, 0)';
		futurePage.style.opacity = 1;

		// set transforms for the other items in the stack
		for(var i = 0, len = stackPagesIdxs.length; i < len; ++i) {
			var page = $rootScope.pages[stackPagesIdxs[i]];
			page.style.WebkitTransform = 'translate3d(0,100%,0)';
			page.style.transform = 'translate3d(0,100%,0)';
		}

		// set current
		if( id ) {
			$rootScope.current = futureCurrent;
		}

		// close menu..
    $($rootScope.menuCtrl).removeClass('menu-button--open');
    $($rootScope.nav).removeClass('pages-nav--open');
		$rootScope.onEndTransition(futurePage, function() {
      $($rootScope.stack).removeClass('pages-stack--open');
			// reorganize stack
			$rootScope.buildStack();
			$rootScope.isMenuOpen = false;
		});
	};

  $rootScope.menuOpenPage = function(event, pageid) {
    if( $rootScope.isMenuOpen ) {
      //event.preventDefault();
      $rootScope.openPage(pageid);
    }
  };

  $rootScope.init = function() {
		$rootScope.buildStack();
	};

  $rootScope.init();

});

myApp.directive('myDirective', function() {
  return {
      restrict: 'AE',
      templateUrl: function(ele, attrs) {
          return attrs.templatePath;
      },
      scope:{
            onLoadCallback: '&'
      },
      link: function(scope) {
          return scope.onLoadCallback();
      },
      controller: ["$scope", "$rootScope", function($scope, $rootScope) {

                $scope.goToPage = function(id) {
                    $rootScope.openMenu();
                    $rootScope.openPage(id);
                };
        }]
  };
});
