import './FeedbackAnalysis.css';
import {Table} from 'antd';
import 'antd/dist/antd.css';

const FeedbackAnalysis: React.FC = () => {
  const columns = [
    {
      title: 'Putt',
      dataIndex: 'putt',
    },
    {
      title: 'Velocity',
      dataIndex: 'velocity',
    },
    {
      title: 'Angle',
      dataIndex: 'angle',
    }
  ]
  const data = [
    {
      key: '1',
      putt: 'Putt 1',
      velocity: '10 m/s',
      angle: '2 degrees left'
    },
    {
      key: '2',
      putt: 'Putt 2',
      velocity: '11 m/s',
      angle: 'Perfect'
    },
    {
      key: '3',
      putt: 'Putt 3',
      velocity: '9 m/s',
      angle: '1 degrees right'
    },
    {
      key: '4',
      putt: 'Putt 4',
      velocity: '10 m/s',
      angle: '3 degrees left'
    }
  ]
  return (
    <div className="feedback">
        <Table 
          columns = {columns}
          dataSource = {data}
          bordered
          title={()=> 'Putt History'}
        />
    </div>
  );
};

export default FeedbackAnalysis;