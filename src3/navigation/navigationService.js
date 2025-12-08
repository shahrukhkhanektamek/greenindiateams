import { createRef } from 'react';

export const navigationRef = createRef();

export function navigate(name, params) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  }
}

export function reset(name) {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name }],
    });
  }
}

