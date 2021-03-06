import React from "react";
import axios from "axios";

import { connect } from "react-redux";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { setMovies } from "../../actions/actions";

import { MovieView } from "../movie-view/movie-view";
import { LoginView } from "../login-view/login-view";
import { RegisterView } from "../registration-view/registration-view";

import { MovieCard } from "../movie-card/movie-card";
import { GenreView } from "../genre-view/genre-view";
import { DirectorView } from "../director-view/director-view";
import { ProfileView } from "../profile-view/profile-view";
import { Button } from "react-bootstrap";
import "./main-view.scss";

export class MainView extends React.Component {
  constructor() {
    super();
    this.state = {
      //movies: null,
      selectedMovie: null,
      user: null,
      isRegistration: null
    };
  }

  onLoggedIn(authData) {
    this.setState({
      user: authData.user
    });

    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
    this.getMovies(authData.token);
  }

  getMovies(token) {
    axios
      .get("https://shashank-my-flix.herokuapp.com/movies", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        this.props.setMovies(response.data);
      })
      //assign result to state
      /*this.setState({
          movies: response.data
        });
      })*/
      .catch(function(error) {
        console.log(error);
      });
  }

  // One of the "hooks" available in a React Component
  componentDidMount() {
    let accessToken = localStorage.getItem("token");
    if (accessToken !== null) {
      this.setState({
        user: JSON.parse(localStorage.getItem("user"))
      });
      this.getMovies(accessToken);
    }
  }

  openRegistration = () => {
    this.setState({ isRegistration: true });
  };

  openLogin = () => {
    this.setState({ isRegistration: null });
  };

  onRegistered = ({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    this.setState({
      user: user,
      isRegistration: false
    });
  };

  onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.setState({
      user: null
    });
  };

  render() {
    // #2
    let { movies } = this.props;
    let { user, isRegistration } = this.state;

    // If the state isn't initialized, this will throw on runtime
    // before the data is initially loaded

    if (isRegistration)
      return (
        <RegisterView
          onRegistered={this.onRegistered}
          openLogin={this.openLogin}
        />
      );
    if (!user)
      return (
        <LoginView
          onLoggedIn={authData => this.onLoggedIn(authData)}
          openRegistration={this.openRegistration}
        />
      );

    // Before the movies have been loaded
    if (!movies) return <div className="main-view" />;

    return (
      <Router>
        <div className="row p-3">
          <Button
            variant="outline-dark"
            className="col-12 row-1"
            onClick={this.onLogout}
          >
            Log Out
          </Button>

          <Route
            exact
            path="/"
            render={() => movies.map(m => <MovieCard key={m._id} movie={m} />)}
          />
          <Route
            path="/movies/:movieId"
            render={({ match }) => (
              <MovieView
                movie={movies.find(m => m._id === match.params.movieId)}
              />
            )}
          />
          <Route
            path="/genres/:name"
            render={({ match }) => (
              <GenreView
                genre={
                  movies.find(m => m.Genre.Name === match.params.name).Genre
                }
              />
            )}
          />

          <Route
            path="/directors/:name"
            render={({ match }) => {
              return (
                <DirectorView
                  director={
                    movies.find(m => m.Director.Name === match.params.name)
                      .Director
                  }
                />
              );
            }}
          />
          <Route
            path="/profile"
            render={() => <ProfileView user={user} movies={movies} />}
          />
          <Button
            href="/profile"
            type="button"
            variant="outline-warning"
            className="col-12 row-1"
          >
            User
          </Button>
        </div>
      </Router>
    );
    /* return (
       <div className="row p-3">
         <Button variant='outline-dark' className="col-12 row-1" onClick={deauth => this.onLogout(deauth)}>Log Out</Button>
          {selectedMovie
            /*?
            <MovieView movie={selectedMovie}  onClick={()=>this.goBack()}/>
                      : movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} onClick={movie => this.onMovieClick(movie)}/>
            ))
          }
       </div>
      ); */
  }
}

// #3
let mapStateToProps = state => {
  return { movies: state.movies };
};

// #4
export default connect(mapStateToProps, { setMovies })(MainView);
