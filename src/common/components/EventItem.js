import React from 'react';
import Dialog from 'material-ui/Dialog';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import Daterange from './Daterange';
import Text from './Text';
import EditEvent from './EditEvent';

export default class EventItem extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        location: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        saveEvent: React.PropTypes.func,
    }

    state = {
        edit: false,
        extra: true,
    }

    toggleEdit = () => {
        this.setState({
            edit: !this.state.edit,
        });
    }

    closeEdit = () => {
        this.setState({
            edit: false,
        });
    }

    render() {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{this.props.title}</h3>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                    </IconMenu>
                </div>
                <div className="meta">
                    <Daterange start={this.props.start} end={this.props.end} />
                </div>
                <Text text={this.props.mdtext} />
                <Dialog
                    title="Rediger aktivitet"
                    open={this.state.edit}
                    onRequestClose={this.closeEdit}
                    autoScrollBodyContent
                >
                    <EditEvent
                        saveEvent={this.props.saveEvent}
                        closeEdit={this.closeEdit}
                        {...this.props}
                    />
                </Dialog>
            </div>
        );
    }
}
