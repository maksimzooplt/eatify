import React, { useState } from 'react'
// node.js library that concatenates classes (strings)
// react plugin used to create charts
import TableTile from '../components/Dashboard/TableTile'
// reactstrap components
import {
  Container,
  Row,
  Card,
  FormGroup
} from 'reactstrap'

import Header from '../components/Headers/Header.jsx'

const Dashboard = props => {
  const [showQRView, setShowQRView] = useState(true)

  const adminData = JSON.parse(localStorage.getItem('user-enatega'))

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row className="mt-5">
        
          <Card className="col-12">
          <label
          className="form-control-label"
          htmlFor="input-available">
          QR code
        </label>
        <FormGroup>
          <label className="custom-toggle">
            <input
              defaultChecked={showQRView}
              type="checkbox"
              onChange={event => {
                setShowQRView(event.target.checked)
              }}
            />
            <span className="custom-toggle-slider rounded-circle" />
          </label>
        </FormGroup>
            <Row className="mt-5">
              <TableTile className="col-3" isQRView={showQRView} adminData={adminData.userId} tableNumber='12' status="Ordering"/>
              <TableTile className="col-3" isQRView={showQRView} adminData={adminData.userId} tableNumber='13' status="Cooking"/>
              <TableTile className="col-3" isQRView={showQRView} adminData={adminData.userId} tableNumber='14' status="Watching Menu"/>
              <TableTile className="col-3" isQRView={showQRView} adminData={adminData.userId} tableNumber='15' status="In Progress"/>
            </Row>  
          </Card>

        </Row>
      </Container>
    </>
  )
}

export default Dashboard
