import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Header, Segment, Icon,Grid } from "semantic-ui-react";

import { Worklist } from "../Worklist/Worklist";
import { DashboardWidget } from "../DashboardWidget/DashboardWidget";

class Dashboard extends Component {
  render() {
    return (
        <div>
           <Grid verticalAlign='middle' columns={2}>
              <Grid.Row>
                 <Grid.Column width={10}>
                    <Header as="h2" textAlign="left">
                      <Icon name='list alternate' />
                      Worklist
                    </Header>
                 </Grid.Column>
                 <Grid.Column width={6}> <DashboardWidget type="getNext" floated='right' /> </Grid.Column>
              </Grid.Row>
           </Grid>
           <Grid>
              <Grid.Row>
                 <Grid.Column>
                     <Worklist />
                 </Grid.Column>
              </Grid.Row>
           </Grid>
          </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const connectedDashboard = connect(mapStateToProps)(Dashboard);
export { connectedDashboard as Dashboard };
