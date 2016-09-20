import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
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

        let menubutton = null;
        if (viewer) {
            menubutton = <MenuIcon onTouchTap={this.handleToggle} color="white" />;
        }

        return (
            <div>
                <AppBar
                    title={<Link to="/" style={{ fontFamily: 'Merriweather, serif', color: 'white', textDecoration: 'none' }}>{this.props.organization.name}</Link>}
                    iconStyleLeft={{ padding: 10 }}
                    iconElementLeft={menubutton}
                    style={{ backgroundColor: '#024059' }}
                />
                <Drawer
                    width={120}
                    docked={false}
                    open={this.state.open}
                    onRequestChange={this.handleOpen}
                >
                    <Menu>
                        <MenuItem>
                            <Link to="/" onTouchTap={this.handleClose}>Home</Link>
                        </MenuItem>
                        <MenuItem>
                            <Link to="projects" onTouchTap={this.handleClose}>Prosjekter</Link>
                        </MenuItem>
                        <MenuItem>
                            <Link to="about" onTouchTap={this.handleClose}>About</Link>
                        </MenuItem>
                    </Menu>
                </Drawer>
            </div>
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
