import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';

import theme from '../theme';
import SendContactEmailMutation from '../mutations/SendContactEmail';

import ContactForm from './ContactForm';

class Footer extends React.Component {
    static propTypes = {
        organization: PropTypes.object.isRequired,
        relay: PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    state = {
        contactDialogOpen: false,
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    sendEmail = (form) => {
        const { relay } = this.props;
        SendContactEmailMutation.commit(relay.environment, form);
    }

    openEmailDialog = () => {
        this.setState({ contactDialogOpen: true });
    }

    closeEmailDialog = () => {
        this.setState({ contactDialogOpen: false });
    }

    render() {
        const { organization } = this.props;
        return (
            <footer>
                <div style={{ textAlign: 'center', marginTop: 50, marginBottom: 80 }}>
                    <ContactForm
                        open={this.state.contactDialogOpen}
                        close={this.closeEmailDialog}
                        save={this.sendEmail}
                        organization={organization}
                    />
                    <a onTouchTap={this.openEmailDialog} style={{ cursor: 'pointer' }}>
                        <i className="fa fa-fw fa-envelope fa-3x" />
                    </a>
                    <a href={`https://facebook.com/${organization.facebook}`}>
                        <i className="fa fa-fw fa-facebook fa-3x" />
                    </a>

                    <a href={`https://www.instagram.com/${organization.instagram}/`}>
                        <i className="fa fa-fw fa-instagram fa-3x" />
                    </a>
                    <a href={`https://twitter.com/${organization.twitter}`}>
                        <i className="fa fa-fw fa-twitter fa-3x" />
                    </a>
                    <div
                        style={{
                            fontFamily: 'Merriweather, serif',
                            fontSize: '1.0rem',
                            marginTop: 20,
                        }}
                    >
                        © Musikkforeningen Nidarholm
                    </div>
                </div>
            </footer>
        );
    }
}

export default createFragmentContainer(
    Footer,
    graphql`
    fragment Footer_organization on Organization {
    facebook
    instagram
    twitter
    ...ContactForm_organization
    }`,
);
