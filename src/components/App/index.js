import React, { Component } from 'react';
import './styles.scss';
import { getPokemons } from '../../services/getPokemons';
import { Route, Switch, Redirect } from 'react-router-dom';
import PokemonDetails from '../PokemonDetails';
import Home from '../Home';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const amountPokemons = 25;
const urlApi = `https://pokeapi.co/api/v2/pokemon/?limit=${amountPokemons}`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemonList: [],
      filterBy: ''
    };
    this.getUserValue = this.getUserValue.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
  }

  componentDidMount() {
    getPokemons(urlApi)
      .then(data => {
        data.results.forEach(pokemon => {
          getPokemons(pokemon.url).then(pokemon => {
            let pokemonData = pokemon;
            getPokemons(pokemon.species.url).then(moreData => {
              pokemonData = { ...pokemonData, ...moreData };
              this.setState(
                prevState => {
                  return { pokemonList: [...prevState.pokemonList, pokemonData] };
                },
                () => this.orderAndSaveToLocal(this.state.pokemonList)
              );
            });
          });
        });
      })
      .catch(error => console.log('error', error));
  }

  orderAndSaveToLocal(array) {
    if (array.length === amountPokemons) {
      array.sort((pokemonA, pokemonB) => pokemonA.id - pokemonB.id);
      this.setState({ pokemonList: array });
    }
  }

  getUserValue({ target: { value } }) {
    this.setState({ filterBy: value });
  }

  clearFilter() {
    this.setState({ filterBy: '' });
  }

  render() {
    const { pokemonList, filterBy } = this.state;
    return (
      <Route
        render={({ location }) => (
          <div className="page">
            <div className="page__wrapper">
              <TransitionGroup>
                <CSSTransition timeout={300} classNames="fade" key={location.pathname} unmountOnExit>
                  <Switch location={location}>
                    <Route exact path="/home" render={() => <Home filterBy={filterBy} pokemonList={pokemonList} getUserValue={this.getUserValue} />} />
                    <Route exac path="/pokemon/:id" render={routerProps => <PokemonDetails id={routerProps.match.params.id} pokemonList={pokemonList} clearFilter={this.clearFilter} />} />
                    <Redirect from="/" to="/home" />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            </div>
          </div>
        )}
      />
    );
  }
}

export default App;
