import React from 'react';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import ActionLock from 'material-ui/svg-icons/action/lock';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { lightBlue900 } from 'material-ui/styles/colors';
import { Link } from 'react-router';

import theme from '../theme';

class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.state = {
            open: false,
        };
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    handleToggle() {
        this.setState({
            open: !this.state.open,
        });
    }

    handleOpen(state) {
        this.setState({
            open: state,
        });
    }

    handleClose() {
        this.setState({
            open: false,
        });
    }

    render() {
        const viewer = this.props.viewer;

        return (
            <Toolbar style={{ backgroundColor: lightBlue900 }}>
                <ToolbarGroup firstChild>
                    <ToolbarTitle
                        text={
                            <Link
                                to="/"
                                style={{
                                    fontFamily: 'Merriweather, serif',
                                    color: 'white',
                                    textDecoration: 'none',
                                }}
                            >
                                <img
                                    src="/img/btn.png"
                                    alt="Nidarholm-logo"
                                    style={{ marginLeft: -10 }}
                                />
                            </Link>
                            }
                    />
                </ToolbarGroup>
                <ToolbarGroup lastChild>
                    <nav className="main">
                        <Link to="about" onTouchTap={this.handleClose} style={{ color: 'white' }}>
                            Om oss
                        </Link>
                        <Link to="projects" onTouchTap={this.handleClose} style={{ color: 'white' }}>
                            Konserter
                        </Link>
                        <Link to="/" onTouchTap={this.handleClose} style={{ color: 'white' }}>
                            Medlemmer
                        </Link>
                        <Link to="/" onTouchTap={this.handleClose} style={{ color: 'white' }}>
                            Støtt oss
                        </Link>
                    </nav>
                    <RaisedButton label="Logg inn" icon={<ActionLock />} style={{ marginRight: 10 }}/>
                </ToolbarGroup>
            </Toolbar>
        );
    }
}

Navigation.propTypes = {
    viewer: React.PropTypes.object,
    organization: React.PropTypes.object,
    socket: React.PropTypes.object,
};

Navigation.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Navigation;
