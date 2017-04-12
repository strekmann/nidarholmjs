import React from 'react';
import Helmet from 'react-helmet';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';
import Footer from './Footer';
import Navigation from './Navigation';
import BottomNavigation from './BottomNavigation';

class App extends React.Component {
    static propTypes = {
        children: React.PropTypes.element,
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        const { organization } = this.props;
        const imageUrl = `${organization.baseurl}/img/Musikkforeningen-Nidarholm-dir-Trond-Madsen-1.jpg`;
        return (
            <div>
                <Helmet
                    titleTemplate="%s – Nidarholm"
                    defaultTitle="Nidarholm"
                    meta={[
                        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                        { name: 'author', content: 'Musikkforeningen Nidarholm' },
                        { property: 'og:site_name', content: 'Nidarholm' },
                        { property: 'og:url', content: organization.baseurl },
                        { property: 'og:title', content: 'Nidarholm' },
                        { property: 'og:image', content: imageUrl },
                        { property: 'fb:app_id', content: organization.facebookAppid },
                    ]}
                    link={[
                        { rel: 'stylesheet', href: '/styles.css' },
                    ]}
                />
                <Navigation
                    viewer={this.props.viewer}
                    organization={organization}
                />
                {this.props.children}
                <Footer
                    viewer={this.props.viewer}
                    organization={organization}
                />
                <BottomNavigation
                    organization={organization}
                />
            </div>
        );
    }
}

export default Relay.createContainer(App, {
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                ${Navigation.getFragment('viewer')}
            }`;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                baseurl
                facebookAppid
                ${Navigation.getFragment('organization')}
                ${BottomNavigation.getFragment('organization')}
                ${Footer.getFragment('organization')}
            }`;
        },
    },
});
