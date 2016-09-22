import React from 'react';
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
            <div className="flexy" style={{ backgroundColor: lightBlue900, display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%' }}>
                <Link
                    to="/"
                    style={{
                        fontFamily: 'Merriweather, serif',
                        color: 'white',
                        textDecoration: 'none',
                        padding: 0,
                    }}
                >
                    <img
                        src="/img/btn.png"
                        alt="Nidarholm-logo"
                        style={{ marginLeft: -10 }}
                    />
                </Link>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Link to="about" style={{ color: 'white' }}>
                        Om oss
                    </Link>
                    <Link to="/projects" style={{ color: 'white' }}>
                        Konserter
                    </Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <a href="/members" style={{ color: 'white' }}>
                        Medlemmer
                    </a>
                    <a href="/stott-oss" style={{ color: 'white' }}>
                        Støtt oss
                    </a>
                </div>
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
