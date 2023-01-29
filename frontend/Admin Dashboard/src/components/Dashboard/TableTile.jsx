import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Modal } from 'reactstrap'
import QRcode from 'qrcode.react'

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: (props) => {
      switch (props.status) {
        case 'Watching menu':
          return '#7A7A90';
        case 'Ordering':
          return '#ffd54f';
        case 'In Progress':
          return '#0EBC20';
        case 'Calling Waiter':
          return '#D10F0F';
        case 'Cooking':
          return '#D8B606';
        default:
          return '#23232B';
      }
    },
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    width: '260px',
    borderRadius: '12px',
    maxHeight: (props) => props.expanded || !props.isQRView ? '250px' : '110px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize:'24px',
    color:'white'
  },
  cardStatus: {
    fontWeight: 'bold',
    padding: theme.spacing(1),
  },
  cardBody: {
    padding: theme.spacing(2),
    display: 'flex'
  },
  position: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  positionTitle: {
    fontWeight: 'bold',
  },
  positionActions: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const TableTile = (props) => {
  const [expanded, setExpanded] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const classes = useStyles({...props, expanded});

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("myqr");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "myqr.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

  return (<>
    {props.isQRView ? (<div className={classes.card}>
      <div className={classes.cardHeader}>
        <div>
          <h3 className={classes.cardTitle}>Table {props.tableNumber}</h3>
          <p className={classes.cardStatus}>{props.status}</p>
        </div>
        <button onClick={toggleExpanded}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {expanded && (
        <div className={classes.cardBody}>
          <h4>Ordered Positions</h4>
          {props.positions ? props.positions.map((position) => (
            <div key={position.id} className={classes.position}>
              <div>
                <span className={classes.positionTitle}>{position.title}</span>
                {' - '}
                <span>{position.quantity}</span>
              </div>
              <div className={classes.positionActions}>
                <button onClick={() => props.incrementQuantity(position.id)}>+</button>
                <button onClick={() => props.decrementQuantity(position.id)}>-</button>
                <button onClick={() => props.markAsDone(position.id)}>Mark as done</button>
                <button onClick={() => props.deletePosition(position.id)}>Delete</button>
              </div>
            </div>
          )): (<h6>No positions yet</h6>)}
          <button onClick={() => setModalOpened(true)}>Add new position</button>
          {modalOpened && (
            <Modal>
              <h4>Add new position</h4>
              <input placeholder="Position title" value={props.newPositionTitle} onChange={props.handleTitleChange} />
              <button onClick={props.addPosition}>Add position</button>
              <button onClick={() => setModalOpened(false)}>Close</button>
            </Modal>
          )}
        </div>
      )}
    </div>) : (
    <div className={classes.card}>
        <div className={classes.cardHeader}>
        <div>
            <h3 className={classes.cardTitle}>Table {props.tableNumber}</h3>
            <p className={classes.cardStatus}>QRCode</p>
        </div>
        </div>
        <div className={classes.cardBody}>
            <QRcode 
                id="myqr"
                value={`https://google.com/${props.adminData}/${props.tableNumber}`} 
                size={100}
                includeMargin={true}
            />
            <button onClick={downloadQR} style={{marginLeft:10}}>
                Download QR
            </button>
        </div>
    </div>
    )}
  </>
  );
};

export default TableTile;
