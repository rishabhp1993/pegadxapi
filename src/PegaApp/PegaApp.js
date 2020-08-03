import React, { Component } from "react";
import {Router, Route, BrowserRouter, HashRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  Container,
  Message,
  Sidebar,
  Menu,
  Icon
} from "semantic-ui-react";
import "react-dates/initialize";

import { history } from "../_helpers";
import { PrivateRoute } from "../_components";
import { Workarea } from "../Workarea/Workarea";
import { LoginPage } from "../LoginPage";
import { AppHeader } from "../AppHeader";
import {
  alertActions,
  caseActions,
  assignmentActions,
  userActions
} from "../_actions";

class PegaApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      recentsLoading: false
    };
  }

  componentDidMount() {
    if (this.props.user.loggedIn && this.props.caseTypes.length === 0) {
      this.props.dispatch(caseActions.getCaseTypes());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user.loggedIn && nextProps.user.loggedIn) {
      this.props.dispatch(caseActions.getCaseTypes());
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.visible && nextState.visible) {
      this.setState({ recentsLoading: true });
      this.props
        .dispatch(userActions.getRecents())
        .then(() => this.setState({ recentsLoading: false }));
    }
  }

  getMenuItemsForCases() {
    let validCases = [];

    this.props.caseTypes.forEach(caseType => {
      if (caseType.CanCreate === "true") {
        validCases.push(
          <Menu.Item
            key={caseType.name}
            name={caseType.name}
            content={caseType.name}
            onClick={e =>
              this.createCase(caseType.ID, false)
            }
            style={{fontSize: '14px'}}
          />
        );
      }
    });

    return validCases;
  }

  getMenuItemsForRecents() {
    if (this.state.recentsLoading) {
      return <Menu.Item name="loading" content="Loading..." style={{fontSize: '14px'}} />;
    }

    const recents = this.props.user.recents;

    return recents.map(data => (
      <Menu.Item
        key={data.caseID}
        name={data.caseId}
        content={data.label + " | " + data.id}
        onClick={() => this.openRecent(data.caseID)}
        style={{fontSize: '14px'}}
      />
    ));
  }

  openRecent(caseID) {
    this.props.dispatch(assignmentActions.addOpenAssignment(caseID));

    this.props.dispatch(caseActions.getCase(caseID)).then(data => {
      if (
        data.aCase &&
        data.aCase.assignments &&
        data.aCase.assignments.length > 0
      ) {
        this.props.dispatch(
          assignmentActions.getAssignment(data.aCase.assignments[0].ID)
        );
      } else {
        // TODO: Show confirm harness here, if page ID is available
        this.props.dispatch(assignmentActions.closeAssignment(caseID));
      }
    });

    this.setState({ visible: false });
  }

  createCase(id, startingProcess) {
    if (startingProcess.requiresFieldsToCreate === "true") {
      this.props.dispatch(caseActions.getCaseCreationPage(id));
    } else {
      this.props.dispatch(caseActions.createCase(id));
    }

    this.setState({ visible: false });
  }

  closeSidebar() {
    if (this.state.visible) {
      this.setState({ visible: false });
    }
  }

  toggleSidebar = () => this.setState({ visible: !this.state.visible });

  handleAlertDismiss = id => {
    this.props.dispatch(alertActions.closeAlert(id));
  };

  render() {
    return (
      <Router history={history}>
        <div id="router-root">
          <AppHeader toggleSidebar={this.toggleSidebar} />
          <Sidebar.Pushable>
            <Sidebar
              as={Menu}
              animation="push"
              visible={this.state.visible}
              width="wide"
              push
              vertical  
              className="sidebar"
            >
              <Menu.Item name="create">
                <Menu.Header style={{fontSize: '16px'}}>
                  <Icon name="plus" />
                  Create New
                </Menu.Header>
                <Menu.Menu>
            {this.getMenuItemsForCases()}
          </Menu.Menu>
              </Menu.Item>
              
              <Menu.Item name="recents">
                <Menu.Header style={{fontSize: '16px'}}>
                  <Icon name="history" />
                  Recents
                </Menu.Header>
                <Menu.Menu>
                {this.getMenuItemsForRecents()}
                </Menu.Menu>
              </Menu.Item>
              
            </Sidebar>
            <Sidebar.Pusher
              dimmed={this.state.visible} 
              onClick={() => this.closeSidebar()}>
              <div className="workarea">
                <Container className="main">
                  <Route path="/login" component={LoginPage} />
                </Container>
                <PrivateRoute exact path="/" component={Workarea} />
              </div>
              <Container className="alert-container">
                {this.props.alert.activeAlerts.map((alert, index) => (
                  <Message
                    floating
                    key={index}
                    negative={alert.negative}
                    positive={alert.positive}
                    onDismiss={() => this.handleAlertDismiss(alert.id)}
                  >
                    <Message.Header>
                      {alert.code
                        ? `${alert.code}: ${alert.message}`
                        : alert.message}
                    </Message.Header>
                  </Message>
                ))}
              </Container>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </Router>
    );
  }
}

function mapStateToProps(state) {
  const { alert, cases, user } = state;
  return {
    alert,
    caseTypes: cases.caseTypes,
    user: user
  };
}

const connectedPegaApp = connect(mapStateToProps)(PegaApp);
export { connectedPegaApp as PegaApp };
