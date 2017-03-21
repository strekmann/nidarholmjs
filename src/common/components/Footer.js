import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';
import SendContactEmailMutation from '../mutations/sendContactEmail';
import ContactForm from './ContactForm';

class Footer extends React.Component {
    static propTypes = {
        organization: React.PropTypes.object,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    state = {
        contactDialogOpen: false,
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    sendEmail = (form) => {
        this.setState({ sent: true });
        this.context.relay.commitUpdate(new SendContactEmailMutation({
            email: form.email,
            name: form.name,
            text: form.text,
            organization: this.props.organization,
        }));
    }

    openEmailDialog = () => {
        this.setState({ contactDialogOpen: true });
    }

    closeEmailDialog = () => {
        this.setState({ contactDialogOpen: false });
    }

    render() {
        const org = this.props.organization;
        return (
            <footer>
                <div style={{ textAlign: 'center', marginTop: 50, marginBottom: 80 }}>
                    <ContactForm
                        open={this.state.contactDialogOpen}
                        close={this.closeEmailDialog}
                        save={this.sendEmail}
                        organization={this.props.organization}
                    />
                    <a onTouchTap={this.openEmailDialog}>
                        <i className="fa fa-fw fa-envelope fa-3x" />
                    </a>
                    <a href={`https://facebook.com/${org.facebook}`}>
                        <i className="fa fa-fw fa-facebook fa-3x" />
                    </a>

                    <a href={`https://www.instagram.com/${org.instagram}/`}>
                        <i className="fa fa-fw fa-instagram fa-3x" />
                    </a>
                    <a href={`https://twitter.com/${org.twitter}`}>
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

export default Relay.createContainer(Footer, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                email
                facebook
                instagram
                twitter
                ${ContactForm.getFragment('organization')}
                ${SendContactEmailMutation.getFragment('organization')}
            }`;
        },
    },
});
