import React from 'react';
import ActionLock from 'material-ui/svg-icons/action/lock';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { fullWhite, lightBlue900 } from 'material-ui/styles/colors';
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
        const logo = (
            <Link
                to="/"
                onClick={this.handleClose}
                style={{
                    fontFamily: 'Merriweather, serif',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '19px 10px 20px 9px',
                }}
            >
                <img
                    src="/img/btn.png"
                    alt="Nidarholm-logo"
                    style={{ marginLeft: -15 }}
                />
            </Link>
        );

        return (
            <div style={{ backgroundColor: lightBlue900 }}>
                <div className="flex-menu-desktop">
                    <div
                        className="flex-menu"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            minWidth: 300,
                            width: '100%',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ flexBasis: 'auto' }}>
                            {logo}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexGrow: 1,
                                justifyContent: 'flex-start',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexGrow: 1,
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Link to="about" style={{ color: 'white' }}>
                                Om oss
                            </Link>
                            <Link to="/projects" style={{ color: 'white' }}>
                                Konserter
                            </Link>
                            <a href="/members" style={{ color: 'white' }}>
                                Medlemmer
                            </a>
                            <a href="/stott-oss" style={{ color: 'white' }}>
                                Støtt oss
                            </a>
                            <RaisedButton
                                label="Logg inn"
                                icon={<ActionLock />}
                                style={{ margin: '12px 15px 12px 10px' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex-menu-mobile" style={{ position: 'relative' }}>
                    {logo}
                    <button
                        className="flex-menu-handler"
                        onClick={this.handleToggle}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '16px 15px 15px 1rem',
                            outline: 'none',
                            backgroundColor: lightBlue900,
                            margin: 0,
                        }}
                    >
                        <NavigationMenu color={fullWhite} />
                    </button>
                    {this.state.open ?
                        <div className="flex-menu" style={{ display: 'flex', flexWrap: 'wrap', minWidth: 270, width: '100%' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                <Link to="about" style={{ color: 'white' }} onClick={this.handleClose}>
                                    Om oss
                                </Link>
                                <Link to="/projects" style={{ color: 'white' }} onClick={this.handleClose}>
                                    Konserter
                                </Link>
                                <a href="/members" style={{ color: 'white' }} onClick={this.handleClose}>
                                    Medlemmer
                                </a>
                                <a href="/stott-oss" style={{ color: 'white' }} onClick={this.handleClose}>
                                    Støtt oss
                                </a>
                                <RaisedButton
                                    label="Logg inn"
                                    icon={<ActionLock />}
                                    style={{ margin: '1rem' }}
                                />
                            </div>
                        </div>
                        : null
                    }
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
