/* eslint "react/require-default-props": 0 */

import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ActionLockOpen from 'material-ui/svg-icons/action/lock-open';
import Person from 'material-ui/svg-icons/social/person';
import Avatar from 'material-ui/Avatar';
import { Menu, MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { fullWhite, indigo900 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import Link from 'found/lib/Link';

import theme from '../theme';


class Navigation extends React.Component {
    static propTypes = {
        viewer: PropTypes.object,
        organization: PropTypes.object,
        //socket: PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    };

    state = {
        open: false,
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    handleOpen = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    }

    handleClose = () => {
        this.setState({
            open: false,
        });
    }

    renderAvatar = () => {
        const viewer = this.props.viewer;
        if (viewer.profilePicture) {
            return (
                <Avatar
                    src={viewer.profilePicture.thumbnailPath}
                    style={{ margin: '0 5px' }}
                />
            );
        }
        return (
            <Avatar
                icon={<Person />}
                style={{ margin: '0 5px' }}
            />
        );
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        const isMember = org.isMember;
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
                        height: 75,
                        width: 196,
                        paddingTop: 4,
                        marginBottom: -18,
                    }}
                />
            </Link>
        );
        return (
            <div style={{ backgroundColor: indigo900 }}>
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
                                Prosjekter
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
                                ? <Link
                                    to={`/users/${viewer.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '-5px 0',
                                        color: 'white',
                                    }}
                                >
                                    {this.renderAvatar()}
                                    <span>{viewer.name}</span>
                                </Link>
                                : <Link
                                    to="/login"
                                    style={{
                                        padding: 0,
                                        margin: '12px 15px 12px 10px',
                                    }}
                                >
                                    <RaisedButton
                                        label="Logg inn"
                                        icon={<ActionLockOpen />}
                                    />
                                </Link>
                            }
                        </div>
                    </nav>
                </div>
                <div className="flex-menu-mobile">
                    <div style={{ flexGrow: 1 }}>
                        {logo}
                    </div>
                    <div>
                        {this.props.viewer
                            ? <Link to={`/users/${viewer.id}`}>
                                {this.renderAvatar()}
                            </Link>
                            : <Link to="/login">
                                <RaisedButton
                                    style={{ minWidth: 44, marginLeft: 10 }}
                                    icon={<ActionLockOpen />}
                                />
                            </Link>
                        }
                    </div>
                    <div>
                        <IconButton
                            className="flex-menu-handler"
                            onTouchTap={this.handleOpen}
                            touch
                        >
                            <NavigationMenu color={fullWhite} />
                        </IconButton>
                        <Popover
                            open={this.state.open}
                            anchorEl={this.state.anchorEl}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                            onRequestClose={this.handleClose}
                        >
                            <nav
                                className="flex-menu"
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-around',
                                    width: '100%',
                                    backgroundColor: indigo900,
                                }}
                            >
                                <Menu>
                                    <MenuItem>
                                        <Link
                                            to="/about"
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
                                            Prosjekter
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
                                {isMember
                                    ? <Menu>
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
                                    : null
                                }
                            </nav>
                        </Popover>
                    </div>
                </div>
            </div>
        );
    }
}

export default createFragmentContainer(
    Navigation,
    {
        viewer: graphql`
        fragment Navigation_viewer on User {
        id
        name
        profilePicture {
        thumbnailPath
        }
        }`,
        organization: graphql`
        fragment Navigation_organization on Organization {
        id
        isMember
        }`,
    },
);
