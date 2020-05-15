import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  NativeModules,
} from 'react-native';
import { Headline, Caption, useTheme, Title } from 'react-native-paper';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import appleAuth, {
  AppleAuthRequestScope,
  AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
const { RNTwitterSignIn } = NativeModules;
RNTwitterSignIn.init(
  'bc5ESW8eHcKTp0id7UrPLjF6S',
  'XUkGmI0eUuHYMGECdBjclflPEDA75MZ1QBYGx9q9ZmN3lQpdvk'
).then(() => console.log('Twitter SDK initialized'));
import { GoogleSignin } from '@react-native-community/google-signin';
GoogleSignin.configure({
  webClientId:
    '747691333334-bpqn22r9qij9t667h0jj8g486vv7jfqv.apps.googleusercontent.com',
});

export default class LoginScreen extends React.Component<any, any> {
  async onAppleButtonPress() {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: AppleAuthRequestOperation.LOGIN,
      requestedScopes: [
        AppleAuthRequestScope.EMAIL,
        AppleAuthRequestScope.FULL_NAME,
      ],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw 'Apple Sign-In failed - no identify token returned';
    }

    // Create a Firebase credential from the response
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce
    );

    // Sign the user in with the credential
    return auth().signInWithCredential(appleCredential);
  }

  async onFacebookButtonPress() {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccesToken
    const data = await AccessToken.getCurrentAccessToken();
    console.log(data);

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken
    );

    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
  }

  async onTwitterButtonPress() {
    // Perform the login request
    const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();

    // Create a Twitter credential with the tokens
    const twitterCredential = auth.TwitterAuthProvider.credential(
      authToken,
      authTokenSecret
    );

    // Sign-in the user with the credential
    return auth().signInWithCredential(twitterCredential);
  }

  async onGoogleButtonPress() {
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  render() {
    return (
      <>
        <SafeAreaView style={{ flex: 1 }}>
          <Title style={{ textAlign: 'center', fontSize: 18 }}>Login</Title>
          <ScrollView>
            <AppleButton
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.SIGN_IN}
              style={{
                width: 160,
                height: 45,
              }}
              onPress={() =>
                this.onAppleButtonPress().then(() =>
                  console.log('Apple sign-in complete!')
                )
              }
            />
            <Button
              title="Facebook Sign-In"
              onPress={() =>
                this.onFacebookButtonPress().then(() =>
                  console.log('Signed in with Facebook!')
                )
              }
            />
            <Button
              title="Twitter Sign-In"
              onPress={() =>
                this.onTwitterButtonPress().then(() =>
                  console.log('Signed in with Twitter!')
                )
              }
            />
            <Button
              title="Google Sign-In"
              onPress={() =>
                this.onGoogleButtonPress().then(() =>
                  console.log('Signed in with Google!')
                )
              }
            />
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});
