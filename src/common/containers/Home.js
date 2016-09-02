import React from 'react';
import Relay from 'react-relay';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';

import NextProjects from '../components/NextProjects';

class Home extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
        if (props.viewer) {
            this.state = {
            };
        }
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        if (!viewer) {
            return (
                <section>
                    <h1>Logg inn</h1>
                    <form method="post" action="/auth/login">
                        <div>
                            <TextField floatingLabelText="E-post" id="email" name="email" />
                        </div>
                        <div>
                            <TextField floatingLabelText="Passord" id="password" name="password" type="password" />
                        </div>
                        <div>
                            <RaisedButton type="submit" primary>Logg inn</RaisedButton>
                        </div>
                    </form>
                    <h1>Register</h1>
                    <form method="post" action="/auth/register">
                        <div>
                            <TextField floatingLabelText="Name" id="name" name="name" />
                        </div>
                        <div>
                            <TextField floatingLabelText="Username" id="username" name="username" />
                        </div>
                        <div>
                            <TextField floatingLabelText="E-post" id="email" name="email" />
                        </div>
                        <div>
                            <TextField floatingLabelText="Passord" id="password" name="password" type="password" />
                        </div>
                        <div>
                            <RaisedButton type="submit" primary>Registrer</RaisedButton>
                        </div>
                    </form>
                </section>
            );
        }

        return (
            <section>
                <h1>Hei {viewer.name}</h1>
                <p>Du har logga inn</p>

                <NextProjects projects={org.nextProjects} />
            </section>
        );
    }
}
Home.propTypes = {
    viewer: React.PropTypes.object,
    organization: React.PropTypes.object,
};

Home.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(Home, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id,
            name,
            email,
        }`,
        organization: () => Relay.QL`
        fragment on Organization {
            id,
            name,
            nextProjects {
                id,
                title,
                start,
            },
        }`,
    },
});
