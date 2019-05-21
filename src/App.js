import React, { useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import Navbar from './components/Navbar';
import Stripe from './components/Stripe';

export const UserContext = React.createContext();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        console.log('user ---> ', user);
        user ? setUser(user) : setUser(null);
      } catch (error) {
        console.log(error);
      }
    };

    const onHubCapsule = capsule => {
      switch (capsule.payload.event) {
        case 'signIn':
          console.log('signed in');
          getUserData();
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
    <UserContext.Provider value={{ user }}>
      <Router>
        <>
          {/* Navigation */}
          <Navbar user={user} onSignout={handleSignout} />

          {/* Routes */}
          <div>
            <Route exact path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route
              path="/markets/:marketId"
              component={({ match }) => {
                return (
                  <MarketPage user={user} marketId={match.params.marketId} />
                );
              }}
            />
            <Route path="/payments" component={Stripe} />
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
