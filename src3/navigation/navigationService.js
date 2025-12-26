import { createNavigationContainerRef } from '@react-navigation/native';

// Change from createRef() to createNavigationContainerRef()
export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) { // Change .current to .isReady()
    navigationRef.navigate(name, params);
  } else {
    console.log('Navigation not ready yet, will retry...');
    // Retry after a short delay
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
      }
    }, 100);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(name) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name }],
    });
  } else {
    console.log('Navigation not ready for reset, storing intent...');
    // Store the reset intent and execute when ready
    const tryReset = () => {
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name }],
        });
      } else {
        // setTimeout(tryReset, 100);
      }
    };
    // setTimeout(tryReset, 100);
  }
}