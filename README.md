npx react-native run-android --deviceId 1466184a
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/



mkdir -p android/app/src/main/assets
cd android
./gradlew clean
cd ../
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest ./gradlew clean
cd android
./gradlew assembleDebug
cd ../



mkdir -p android/app/src/main/assets
cd android
./gradlew clean
cd ../
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest ./gradlew clean
cd android
./gradlew assembleRelease
cd ../



adb devices
adb tcpip 5555
adb connect 192.168.1.29:5555

vivo
adb devices
adb tcpip 5555
adb connect 192.168.1.32:5555

npm install react-native-image-crop-picker
npx pod-install

mkdir -p android/app/src/main/assets
cd android
./gradlew clean
cd ../
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest ./gradlew clean
npx react-native run-android




cd android
./gradlew clean
cd ..
del node_modules
del android/.cxx
del android/build
del android/app/build
del android/.gradle
npm install
npx react-native start --reset-cache
npx react-native run-android




cd android
./gradlew clean
cd ..
npx react-native run-android



npx react-native start --reset-cache





npx @react-native-community/cli init hellohi



rm -rf node_modules
rm -rf android/build
npm install
cd android
./gradlew clean
cd ..
npx react-native run-android


npx react-native start --reset-cache
npm start -- --reset-cache








Based on the logo, the primary colors and elements that stand out include:

Green (tree leaves and text "S" and "V"): Represents growth, nature, and vitality.
Golden/Yellow (trishul): Symbolizes prosperity and power.
Red (the figure's attire): Represents energy, passion, and spirituality.
Brown (tree trunk): Denotes stability and earthiness.
Here’s a suggested color palette for your mobile app:

Primary Colors
Green: Use shades like #4CAF50 or #2E7D32 for headers, buttons, or primary elements.
Golden/Yellow: Use shades like #FFC107 or #FFD700 for highlights and icons.
Secondary Colors
Red: Use shades like #D32F2F or #C62828 for warnings or important action items.
Brown: Use shades like #795548 or #5D4037 for background elements or dividers.
Neutrals
White: #FFFFFF for backgrounds and contrast.
Gray: #9E9E9E or #E0E0E0 for secondary text or borders.
Would you like me to create a mockup or provide further details on UI usage?







// Function to add a user to the database
  const addUser = async () => {
    try {
      const newUserRef = database().ref('/users').push();
      await newUserRef.set({
        name,
        age: parseInt(age),
      });
      setName('');
      setAge('');
      console.log('User added!');
    } catch (error) {
      console.error('Error adding user: ', error);
    }
  };

  // Fetch users from the database in real-time
  useEffect(() => {
    const usersRef = database().ref('/users');
    const onValueChange = usersRef.on('value', snapshot => {
      const userList = [];
      snapshot.forEach(childSnapshot => {
        userList.push({
          key: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setUsers(userList);
    });

    // Cleanup the listener when the component unmounts
    return () => usersRef.off('value', onValueChange);
  }, []);


  const updateUser = async (userKey, updatedName, updatedAge) => {
  try {
    const userRef = database().ref(`/users/${userKey}`);
    await userRef.update({
      name: updatedName,
      age: parseInt(updatedAge),
    });
    console.log('User updated!');
  } catch (error) {
    console.error('Error updating user: ', error);
  }
};





///// pehli baar 

git init
git remote add origin https://github.com/shahrukhkhanektamek/shivveda-app.git
git add .
git commit -m "Initial React Native project"
git branch -M main
git push -u origin main

///// pehli baar 

git rm -r --cached node_modules
git rm -r --cached android/app/build
git rm -r --cached ios/build

git add .
git commit -m "Clean ignored files"
git push
  

git pull origin main

git add .
git commit -m "Update"
git push





import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';


    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
      // setPage(0);
      setRefreshing(true);
      setRefreshing(false);
      // fetchPosts(page);
    }, []);


   
    <FlatList
        ListHeaderComponent={
        <>
            <View style={theme.themeBg}>
                <View style={[theme.card]}>
                  <View style={[theme.cardBody]}>
                        <Text style={{fontSize:50,textAlign:'center'}}>Tree</Text>
                  </View>
                </View>
            </View>
            </>
            }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />



























This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
