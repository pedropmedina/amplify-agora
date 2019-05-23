import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import './App.css';

import { getUser } from './graphql/queries';
import { registerUser } from './graphql/mutations';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import Navbar from './components/Navbar';

export const history = createBrowserHistory();

export const UserContext = React.createContext();

const App = () => {
  const [user, setUser] = useState(null);
  const [userAttributes, setUserAttributes] = useState(null);

  const registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log({ newUser });
      } catch (error) {
        console.error('Error registering a new user', error);
      }
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const getUserData = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        // user ? setUser(user) : setUser(null);
        if (isSubscribed) {
          if (user) {
            const attributesArr = await Auth.userAttributes(user);
            const attributesObj = await Auth.attributesToObject(attributesArr);
            setUserAttributes(attributesObj);
            setUser(user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    const onHubCapsule = capsule => {
      switch (capsule.payload.event) {
        case 'signIn':
          console.log('signed in');
          getUserData();
          registerNewUser(capsule.payload.data);
          break;
        case 'signUp':
          console.log('singed up');
          break;
        case 'signOut':
          console.log('signed out');
          setUser(null);
          break;
        default:
          return;
      }
    };

    getUserData();
    Hub.listen('auth', onHubCapsule);

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleSignout = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('Error signing out user', error);
    }
  };

  return !user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ user, userAttributes }}>
      <Router history={history}>
        <>
          {/* Navigation */}
          <Navbar user={user} onSignout={handleSignout} />

          {/* Routes */}
          <div>
            <Route exact path="/" component={HomePage} />
            <Route
              path="/profile"
              component={() => (
                <ProfilePage user={user} userAttributes={userAttributes} />
              )}
            />
            <Route
              path="/markets/:marketId"
              component={({ match }) => {
                return (
                  <MarketPage user={user} marketId={match.params.marketId} />
                );
              }}
            />
          </div>
        </>
      </Router>
    </UserContext.Provider>
  );
};

const theme = {
  ...AmplifyTheme
};

export default App;
