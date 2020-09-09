import React, { useMemo, useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import accounting from 'accounting';

import Checkbox from './Checkbox';

import edit from '../img/edit.svg';
import './place.css';


const Basket = ({ match: { params: { areaId, itemId }}, foodAreas, order, setActiveOrder, history, setOrdersParams, ordersParams }) => {
  const
    area = foodAreas.filter(area => area.id === areaId)[0],
    item = area.items.filter(item => item.id === itemId)[0];

  const currentOrderParams = ordersParams && ordersParams[itemId] || {};

  const
    [ time, setTimeToState ] = useState(currentOrderParams['time'] || ''),
    [ selfService, setSelfServiceToState ] = useState('selfService' in currentOrderParams ? currentOrderParams['selfService'] : false),
    [ faster, setFasterToState ] = useState('faster' in currentOrderParams ? currentOrderParams['faster'] : !selfService);

  function syncOrderParam(key, newVal) {
    const
      ordersParamsCopy = JSON.parse(JSON.stringify(ordersParams)),
      newOrdersParams = {
        ...ordersParamsCopy,
        [itemId]: {
          ...(ordersParamsCopy[itemId] || {}),
          [key]: newVal
        }
      };

    setOrdersParams(newOrdersParams);
    ordersParams = newOrdersParams;
  }

  function setTime(newTime) {
    setTimeToState(newTime);

    syncOrderParam('time', newTime);
  }

  function setSelfService(newSelfService) {
    setSelfServiceToState(newSelfService);

    syncOrderParam('selfService', newSelfService);
  }

  function setFaster(newFaster) {
    setFasterToState(newFaster);

    syncOrderParam('faster', newFaster);
  }

  const [ price, products ] = useMemo(() => {
    const foodIds = new Set((item.foods || []).map(item => item.id));

    const products = Object.values(order)
      .filter((value) => {
        const { item: { id }} = value;

        return foodIds.has(id);
      });

    const result = products.reduce((result, value) => {
        const { count, item } = value;

        return result + parseInt(item.price) * parseInt(count);
      }, 0);

    return [ accounting.formatNumber(result, 0, ' '), products ];
  }, [ order, item ]);

  const orderIsAllowed = price > 0 && (!!time || faster);

  return (
    <div className="Place">
      <header className="Place__header">
        <aside className="Place__trz">
          <h1 className="Place__head">
            <Link to="/" className="Place__logo">
              {area.name}
            </Link>
          </h1>
          <Link to="/edit" className="Place__change-tz">
            <img
              alt="change-profile"
              src={edit}
            />
          </Link>
        </aside>
      </header>
      <aside className="Place__restoraunt">
        <img
          className="Place__restoraunt-logo"
          alt="Fastfood logo"
          src={item.image}
        />
        <h2
          className="Place__restoraunt-name"
        >
          {item.name}
        </h2>
        <p className="Place__restoraunt-type">
          {item.description}
        </p>
      </aside>
      <div className="Place__products-wrapper">
        <ul className="Place__products">
          {products.map(({ item, count }) => (
            <li
              className="Place__product"
              key={item.id}
            >
              <img
                className="Place__product-logo"
                alt="Ordered product logo"
                src={item.image}
              />
              <h3
                className="Place__product-name"
              >
                {item.name}
              </h3>
              <p
                className="Place__product-price"
              >
                Цена: {item.price}
              </p>
              <p
                className="Place__product-count"
              >
                x{count}
              </p>
            </li>
          ))}
        </ul>
        <Link
          className="Place__change-product"
          to={`/place/${areaId}/${itemId}`}
        >
          Изменить
        </Link>
      </div>
      <div className="Place__choice">
        <h3>Время:</h3>
        <div className="Place__choice-item">
          <span>Как можно быстрее</span>
          <Checkbox
            checked={faster}
            onToggle={() => {
              if (faster) {
                setFaster(false);
              } else {
                setTime('');
                setFaster(true);
              }
            }}
          />
        </div>
        <div className="Place__choice-item">
          <span>Назначить</span>
          <input
            type="time"
            value={time}
            onFocus={() => {
              setFaster(false);
            }}
            onChange={event => {
              setFaster(false);
              setTime(event.target.value);
            }}
            onBlur={() => {
              if (time) {
                setFaster(false);
              }
            }}
          />
        </div>
        <div className="Place__choice-item">
          <h3>С собой</h3>
          <Checkbox checked={selfService} onToggle={() => setSelfService(!selfService)} />
        </div>
        <div className="Place__choice-item">
          <h3>На месте</h3>
          <Checkbox checked={!selfService} onToggle={() => setSelfService(!setSelfService)} />
        </div>
      </div>
      <footer className="Place__footer">
        <div
          className={`Place__order ${ orderIsAllowed ? '' : 'Place__order_disabled'}`}
          onClick={() => {
            if (!orderIsAllowed) {
              return;
            }

            setActiveOrder({ itemId });

            setTimeout(() => {
              history.push(`/order/${area.id}/${item.id}`);
            }, 0);
          }}
        >
          Оплатить {price}
        </div>
      </footer>
    </div>
  );
};

export default withRouter(Basket);
