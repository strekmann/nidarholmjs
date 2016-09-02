import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';

class Footer extends React.Component {
    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    render() {
        const org = this.props.organization;
        return (
            <footer>
                <hr />
                <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: 1000, margin: 'auto' }}>
                    <div style={{ width: '25%', minWidth: 100 }}>
                        <div>{ org.name }</div>
                        <div>{ org.mail_address }</div>
                        <div>{ org.postcode } { org.city }</div>
                    </div>
                    <div style={{ width: '25%', minWidth: 100 }}>
                        <div>Bank: { org.public_bank_account }</div>
                        <div>Org: { org.organization_number }</div>
                    </div>
                    <div style={{ width: '25%', minWidth: 100 }}>
                        <div>
                            <i className="fa fa-fw fa-envelope" />
                            <span dangerouslySetInnerHTML={{ __html: org.encoded_email }} />
                        </div>
                        { org.facebook ?
                            <div>
                                <i className="fa fa-fw fa-facebook" />
                                <a href={`https://twitter.com/${org.facebook}`}>{org.facebook}</a>
                            </div>
                        : null }
                        { org.twitter ?
                            <div>
                                <i className="fa fa-fw fa-twitter" />
                                <a href={`https://twitter.com/${org.twitter}`}>{org.twitter}</a>
                            </div>
                        : null }
                    </div>
                    <div style={{ width: '25%', minWidth: 100 }}>
                        <div>{ this.props.viewer ? <a href="/auth/logout">Logg ut</a> : null }</div>
                    </div>
                </div>
                <div className="bystrekmann">
                    <a href="https://github.com/strekmann/nidarholm.js">Nidarholm.js</a> by <a href="https://strekmann.no/">Strekmann AS</a>
                </div>
            </footer>
        );
    }
}

Footer.propTypes = {
    viewer: React.PropTypes.object,
    organization: React.PropTypes.object,
};

Footer.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Footer;
