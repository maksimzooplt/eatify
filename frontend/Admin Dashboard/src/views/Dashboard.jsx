import React, { useState } from 'react'
// node.js library that concatenates classes (strings)
// react plugin used to create charts
import TableTile from '../components/Dashboard/TableTile'
// reactstrap components
import {
  Container,
  Row,
  Card
} from 'reactstrap'

import Header from '../components/Headers/Header.jsx'

const Dashboard = props => {

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row className="mt-5">
          <Card className="col-12">
            <Row className="mt-5">
              <TableTile className="col-3" tableNumber='12' status="Ordering"/>
              <TableTile className="col-3" tableNumber='12' status="Cooking"/>
              <TableTile className="col-3" tableNumber='12' status="Watching Menu"/>
              <TableTile className="col-3" tableNumber='12' status="In Progress"/>
            </Row>  
          </Card>

        </Row>
      </Container>
    </>
  )
}

export default Dashboard
