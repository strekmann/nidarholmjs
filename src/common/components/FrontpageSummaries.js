/* eslint "max-len": 0 */
/* eslint "react/no-multi-comp": 0 */

import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React, { PropTypes } from 'react';
import Relay from 'react-relay';

import theme from '../theme';

import SortablePageList from './SortablePageList';

class PageSummaryItem extends React.Component {
    static propTypes = {
        slug: PropTypes.string.isRequired,
        title: PropTypes.string,
        onAdd: PropTypes.func.isRequired,
    }
    onAdd = () => {
        this.props.onAdd(this.props);
    }

    render() {
        const { title, slug } = this.props;
        const addIcon = <IconButton onClick={this.onAdd}><AddCircle /></IconButton>;
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                    <div>{title}</div>
                    <div>/{slug}</div>
                </div>
                <div>{addIcon}</div>
            </div>
        );
    }
}

class FrontpageSummaries extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        summaries: React.PropTypes.array,
        pages: React.PropTypes.object,
        onAdd: React.PropTypes.func,
        onChange: React.PropTypes.func,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        summaries: this.props.summaries,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChange = (summaries) => {
        this.props.onChange(summaries);
    }

    onAdd = (pageId) => {
        this.props.onAdd(pageId);
    }

    render() {
        return (
            <div>
                <h2>Forsidesnutter</h2>
                <p>Hvor mange som vises er avhengig av hvordan forsida er definert. Du kan trykke pluss i den nederste lista for å legge dem til, eller minus i den øverste for å fjerne dem.</p>
                <div style={{ display: 'flex' }}>
                    <div>
                        <h3>Valgte</h3>
                        <SortablePageList
                            pages={this.state.summaries}
                            onChange={this.onChange}
                        />
                    </div>
                    <div>
                        <h3>Mulige</h3>
                        <div style={{ height: 400, overflow: 'scroll', overflowX: 'hidden' }}>
                            {this.props.pages.edges.map((edge) => {
                                return (
                                    <PageSummaryItem
                                        key={edge.cursor}
                                        onAdd={this.onAdd}
                                        {...edge.node}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FrontpageSummaries;
