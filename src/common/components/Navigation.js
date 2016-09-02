import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

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
                    iconStyleLeft={{ padding: 10 }}
                    iconElementLeft={menubutton}
                />
                <Drawer
                    width={120}
                    docked={false}
                    open={this.state.open}
                    onRequestChange={this.handleOpen}
                >
                    Element
                </Drawer>
            </div>
        );
    }
}

Navigation.propTypes = {
    viewer: React.PropTypes.object,
    users: React.PropTypes.object,
    socket: React.PropTypes.object,
};

Navigation.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Navigation;
