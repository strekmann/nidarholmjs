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
                <div style={{ textAlign: 'center', marginTop: 50, marginBottom: 80 }}>
                    <a href={`https://facebook.com/${org.facebook}`}>
                        <i className="fa fa-fw fa-envelope fa-3x" />
                    </a>
                    <a href={`https://facebook.com/${org.facebook}`}>
                        <i className="fa fa-fw fa-facebook fa-3x" />
                    </a>
                    <i className="fa fa-fw fa-instagram fa-3x" />
                    <a href={`https://twitter.com/${org.twitter}`}>
                        <i className="fa fa-fw fa-twitter fa-3x" />
                    </a>
                    <div style={{ fontFamily: 'Merriweather, serif', fontSize: '1.0rem', marginTop: 20 }}>© Musikkforeningen Nidarholm</div>
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