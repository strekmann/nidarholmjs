import React from 'react';
import ActionLock from 'material-ui/svg-icons/action/lock';
import Avatar from 'material-ui/Avatar';
import { Menu, MenuItem } from 'material-ui/Menu';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { fullWhite, pink900 } from 'material-ui/styles/colors';
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
        const org = this.props.organization;
        const isMember = org.is_member;
        const logo = (
            <Link
                to="/"
                onClick={this.handleClose}
                style={{
                    padding: '19px 10px 20px 9px',
                }}
            >
                <img
                    src="/img/logo.wh.svg"
                    alt="Nidarholm-logo"
                    style={{
                        height: 70,
                        paddingTop: 4,
                        marginBottom: -16,
                    }}
                />
            </Link>
        );

        return (
            <div style={{ backgroundColor: pink900 }}>
                <div className="flex-menu-desktop">
                    <nav
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
                                alignItems: 'center',
                            }}
                        >
                            <Link to="/om" style={{ color: 'white' }}>
                                Om oss
                            </Link>
                            <Link to="/projects" style={{ color: 'white' }}>
                                Konserter
                            </Link>
                            <Link to="/members" style={{ color: 'white' }}>
                                Medlemmer
                            </Link>
                            <Link to="/stott-oss" style={{ color: 'white' }}>
                                Støtt oss
                            </Link>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexGrow: 1,
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                            }}
                        >
                            {isMember
                                ? <Link to="/files">Filer</Link>
                                : null
                            }
                            {isMember
                                ? <Link to="/pages">Sider</Link>
                                : null
                            }
                            {isMember
                                ? <Link to="/events">Aktiviteter</Link>
                                : null
                            }
                            {isMember
                                ? <Link to="/music">Notearkiv</Link>
                                : null
                            }
                            {viewer
                                ? <a
                                    href={`/users/${viewer.username}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '-5px 0',
                                        color: 'white',
                                    }}
                                >
                                    <Avatar
                                        src={viewer.profile_picture_path}
                                        style={{ margin: '0 5px' }}
                                    />
                                    <span>{viewer.name}</span>
                                </a>
                                : <Link
                                    to="/login"
                                    style={{
                                        padding: 0,
                                        margin: '12px 15px 12px 10px',
                                    }}
                                >
                                    <RaisedButton
                                        label="Logg inn"
                                        icon={<ActionLock />}
                                    />
                                </Link>
                            }
                        </div>
                    </nav>
                </div>
                <div className="flex-menu-mobile" style={{ position: 'relative', height: 62 }}>
                    {logo}
                    <button
                        className="flex-menu-handler"
                        onClick={this.handleToggle}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            outline: 'none',
                            backgroundColor: 'inherit',
                            margin: 0,
                        }}
                    >
                        <NavigationMenu color={fullWhite} />
                    </button>
                    {this.state.open ?
                        <nav
                            className="flex-menu"
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-around',
                                minWidth: 260,
                                width: '100%',
                                backgroundColor: pink900,
                            }}
                        >
                            <Menu>
                                <MenuItem>
                                    <Link
                                        to="about"
                                        onClick={this.handleClose}
                                    >
                                        Om oss
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/projects"
                                        onClick={this.handleClose}
                                    >
                                        Konserter
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/members"
                                        onClick={this.handleClose}
                                    >
                                        Medlemmer
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <Link
                                        to="/stott-oss"
                                        onClick={this.handleClose}
                                    >
                                        Støtt oss
                                    </Link>
                                </MenuItem>
                            </Menu>
                            <Menu>
                                {isMember
                                    ? <MenuItem>
                                        <Link to="/files" onClick={this.handleClose}>
                                            Filer
                                        </Link>
                                    </MenuItem>
                                    : null
                                }
                                {isMember
                                    ? <MenuItem>
                                        <Link to="/pages" onClick={this.handleClose}>
                                            Sider
                                        </Link>
                                    </MenuItem>
                                    : null
                                }
                                {isMember
                                    ? <MenuItem>
                                        <Link to="/events" onClick={this.handleClose}>
                                            Aktiviteter
                                        </Link>
                                    </MenuItem>
                                    : null
                                }
                                {isMember
                                    ? <MenuItem>
                                        <Link to="/music" onClick={this.handleClose}>
                                            Notearkiv
                                        </Link>
                                    </MenuItem>
                                    : null
                                }
                            </Menu>
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                {this.props.viewer ?
                                    <a href={`/users/${viewer.username}`} style={{ display: 'block' }}>
                                        <Avatar
                                            src={viewer.profile_picture_path}
                                            style={{ marginRight: 5 }}
                                        />
                                        <span style={{ color: 'white' }}>{viewer.name}</span>
                                    </a>
                                    :
                                    <a href="/login" style={{ padding: 0, margin: '1rem' }}>
                                        <RaisedButton
                                            label="Logg inn"
                                            icon={<ActionLock />}
                                        />
                                    </a>
                                }
                            </div>
                        </nav>
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
