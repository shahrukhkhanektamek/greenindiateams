import { createNavigationContainerRef } from '@react-navigation/native';

// Change from createRef() to createNavigationContainerRef()
export const navigationRef = createNavigationContainerRef();

// Store current route listener and current route name
let currentRouteListener = null;
let currentRouteName = null;

// Subscribe to state changes to track current route
export function setupNavigationListeners() {
  if (navigationRef.isReady()) {
    navigationRef.addListener('state', (e) => {
      const routeName = getCurrentRouteName(e.data.state);
      currentRouteName = routeName;
      
      // Notify listener if exists
      if (currentRouteListener) {
        currentRouteListener(routeName);
      }
    });
  }
}

// Helper function to get current route name from state
export function getCurrentRouteName(state = null) {
  if (!state && navigationRef.isReady()) {
    state = navigationRef.getRootState();
  }
  
  if (!state) return null;
  
  const findCurrentRoute = (navState) => {
    if (!navState.routes || navState.index === undefined) {
      return navState;
    }
    
    const route = navState.routes[navState.index];
    
    if (route.state) {
      return findCurrentRoute(route.state);
    }
    
    return route;
  };
  
  const currentRoute = findCurrentRoute(state);
  return currentRoute?.name || null;
}

// Get current route params
export function getCurrentRouteParams() {
  if (!navigationRef.isReady()) return null;
  
  const state = navigationRef.getRootState();
  const findCurrentRoute = (navState) => {
    if (!navState.routes || navState.index === undefined) {
      return navState;
    }
    
    const route = navState.routes[navState.index];
    
    if (route.state) {
      return findCurrentRoute(route.state);
    }
    
    return route;
  };
  
  const currentRoute = findCurrentRoute(state);
  return currentRoute?.params || null;
}

// Navigate function
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log('Navigation not ready yet, will retry...');
    // Retry after a short delay
    const tryNavigate = () => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
      } else {
        setTimeout(tryNavigate, 100);
      }
    };
    setTimeout(tryNavigate, 100);
  }
}

// Navigate and replace (clear back stack)
export function replace(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.replace(name, params);
  } else {
    console.log('Navigation not ready for replace, will retry...');
    const tryReplace = () => {
      if (navigationRef.isReady()) {
        navigationRef.replace(name, params);
      } else {
        setTimeout(tryReplace, 100);
      }
    };
    setTimeout(tryReplace, 100);
  }
}

// Go back function
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

// Check if can go back
export function canGoBack() {
  return navigationRef.isReady() && navigationRef.canGoBack();
}

// Reset navigation stack
export function reset(name, params = {}) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  } else {
    console.log('Navigation not ready for reset, will retry...');
    const tryReset = () => {
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name, params }],
        });
      } else {
        setTimeout(tryReset, 100);
      }
    };
    setTimeout(tryReset, 100);
  }
}



// Reset to specific stack
export function resetToStack(stackName, routes = []) {
  if (navigationRef.isReady()) {
    // Debug log
    console.log('Resetting to stack:', stackName);
    console.log('Routes:', routes);
    
    navigationRef.reset({
      index: routes.length - 1,
      routes: routes.map(route => ({
        name: route.name,
        params: route.params
      })),
    });
  }
}


// Reset to resetToStackForLogout stack
export function resetToStackForLogout(stackName, routes = []) {
 navigationRef.reset({
    index: 0,
    routes: [{ name: 'Home' },{ name: 'Language' }], 
  });
}

// Pop to top of current stack
export function popToTop() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      NavigationActions.popToTop()
    );
  }
}

// Dispatch custom action
export function dispatch(action) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(action);
  }
}

// Subscribe to navigation state changes
export function onNavigationStateChange(callback) {
  // Store the callback
  currentRouteListener = callback;
  
  // Return current route immediately if available
  if (currentRouteName && callback) {
    callback(currentRouteName);
  }
  
  // Return unsubscribe function
  return () => {
    currentRouteListener = null;
  };
}

// Get current screen name
export function getCurrentScreen() {
  return currentRouteName || getCurrentRouteName();
}

// Set params for current route
export function setParams(params) {
  if (navigationRef.isReady()) {
    navigationRef.setParams(params);
  }
}

// Navigation service initialization
export function initializeNavigation() {
  // Setup listeners when navigation is ready
  if (navigationRef.isReady()) {
    setupNavigationListeners();
  } else {
    // Wait for navigation to be ready
    const checkReady = () => {
      if (navigationRef.isReady()) {
        setupNavigationListeners();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    setTimeout(checkReady, 100);
  }
}

// Export for easy access
export default {
  navigationRef,
  navigate,
  goBack,
  reset,
  replace,
  canGoBack,
  getCurrentRouteName,
  getCurrentRouteParams,
  getCurrentScreen,
  onNavigationStateChange,
  setParams,
  popToTop,
  dispatch, 
  initializeNavigation,
};