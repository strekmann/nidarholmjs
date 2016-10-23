import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Footer from './Footer';
import Navigation from './Navigation';
import theme from '../theme';

class App extends React.Component {
    static propTypes = {
        children: React.PropTypes.element,
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
        users: React.PropTypes.array,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme, { userAgent: navigator.userAgent });
    }

    render() {
        return (
            <div>
                <Navigation
                    viewer={this.props.viewer}
                    organization={this.props.organization}
                />
                {this.props.children}
                <Footer
                    viewer={this.props.viewer}
                    organization={this.props.organization}
                />
            </div>
        );
    }
}

App.propTypes = {
    children: React.PropTypes.element,
    viewer: React.PropTypes.object,
    organization: React.PropTypes.object,
    socket: React.PropTypes.object,
    users: React.PropTypes.object,
};

export default Relay.createContainer(App, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            name,
            email,
            username,
            profile_picture_path,
        }`,
        organization: () => Relay.QL`
        fragment on Organization {
            id,
            name,
            mail_address,
            postcode,
            city,
            public_bank_account,
            organization_number,
            encoded_email,
            twitter,
            facebook,
            is_member,
        }`,
    },
});
