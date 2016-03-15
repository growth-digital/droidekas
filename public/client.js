(function() {

  var retrySocket = function() {
    var socket = new WebSocket('ws://' + window.HOSTNAME + ':' + window.PORT, 'subscribe');

    socket.addEventListener('message', function(event) {
      var parameters = JSON.parse(event.data);
      display(parameters);
    });

    socket.addEventListener('open', function(event) {
      console.log('WEBSOCKET OPEN');
    });

    socket.addEventListener('close', function(event) {
      setTimeout(function() {
        retrySocket();
      }, 1000);
    });

  };

  retrySocket();

  var display = function(parameters) {
    var type = parameters.t;
    var addInfo = '';
    if (type === 'screenview') {
      addInfo += parameters.cd;
    } else if (type === 'event') {
      addInfo += [parameters.ec, parameters.ea, parameters.el, !!parameters.ni].join(',');
    } else if (type === 'social') {
      addInfo += [parameters.sn, parameters.sa, parameters.st];
    } else if (type === 'transaction') {
      addInfo += [parameters.ti, parameters.tr];
    } else if (type === 'item') {
      addInfo += [parameters.ic, parameters.in, parameters.iq, parameters.ip];
    } else if (type === 'exception') {
      addInfo += [parameters.exd, !!parameters.exf];
    } else if (type === 'timing') {
      addInfo += [parameters.utc, parameters.utv, parameters.utt];
    }
    console.group(capitalizeFirstLetter(type) + ' - ' + addInfo);
    rename(parameters);
    console.dir(parameters);
    console.groupEnd();
  };

  var rename = function(parameters) {
    var groups;
    var productIdx;
    var cdIdx;
    var listIdx;
    var promoIdx;

    for (var key in parameters) {
      var skipDeletion = false;
      // General
      if ('v' === key) {
        parameters['Protocol Version'] = parameters[key];
      } else if ('tid' === key) {
        parameters['Tracking ID'] = parameters[key];
      } else if ('aip' === key) {
        parameters['Anonymize IP'] = parameters[key];
      } else if ('ds' === key) {
        parameters['Data Source'] = parameters[key];
      } else if ('qt' === key) {
        parameters['Queue Time'] = parameters[key];
      } else if (/^cd$/.test(key)) { // TODO remove from here
        parameters['Screen Name'] = parameters[key];
      }
      // User
      else if ('cid' === key) {
        parameters['Client ID'] = parameters[key];
      } else if ('uid' === key) {
        parameters['User ID'] = parameters[key];
      }
      // Session
      else if ('sc' === key) {
        parameters['Session Control'] = parameters[key];
      } else if ('uip' === key) {
        parameters['IP Override'] = parameters[key];
      } else if ('ua' === key) {
        parameters['User Agent Override'] = parameters[key];
      } else if ('geoid' === key) {
        parameters['Geographical Override'] = parameters[key];
      }
      // Traffic Sources
      else if ('cn' === key) {
        parameters['Campaign Name'] = parameters[key];
      } else if ('cs' === key) {
        parameters['Campaign Source'] = parameters[key];
      } else if ('cm' === key) {
        parameters['Campaign Medium'] = parameters[key];
      } else if ('ck' === key) {
        parameters['Campaign Keyword'] = parameters[key];
      } else if ('cc' === key) {
        parameters['Campaign Content'] = parameters[key];
      } else if ('ci' === key) {
        parameters['Campaign ID'] = parameters[key];
      }
      // System Information
      else if ('sr' === key) {
        parameters['Screen Resolution'] = parameters[key];
      } else if ('ul' === key) {
        parameters['User Language'] = parameters[key];
      }
      // Hit
      else if ('t' === key) {
        parameters['Hit Type'] = parameters[key];
      } else if ('ni' === key) {
        parameters['Non Interaction'] = parameters[key];
      }
      // Application Name
      else if ('an' === key) {
        parameters['Application Name'] = parameters[key];
      } else if ('aid' === key) {
        parameters['Application ID'] = parameters[key];
      } else if ('av' === key) {
        parameters['Application Version'] = parameters[key];
      } else if ('aiid' === key) {
        parameters['Application Installer ID'] = parameters[key];
      }
      // Event Tracking
      else if ('ea' === key) {
        parameters['Event Category'] = parameters[key];
      } else if ('ec' === key) {
        parameters['Event Action'] = parameters[key];
      } else if ('el' === key) {
        parameters['Event Label'] = parameters[key];
      }
      // E-commerce
      else if ('ti' === key) {
        parameters['Transaction ID'] = parameters[key];
      } else if ('ta' === key) {
        parameters['Transaction Affiliation'] = parameters[key];
      } else if ('tr' === key) {
        parameters['Transaction Revenue'] = parameters[key];
      } else if ('ts' === key) {
        parameters['Transaction Shipping'] = parameters[key];
      } else if ('tt' === key) {
        parameters['Transaction Tax'] = parameters[key];
      } else if ('in' === key) {
        parameters['Item Name'] = parameters[key];
      } else if ('ip' === key) {
        parameters['Item Price'] = parameters[key];
      } else if ('iq' === key) {
        parameters['Item Quantity'] = parameters[key];
      } else if ('ic' === key) {
        parameters['Item Code'] = parameters[key];
      } else if ('iv' === key) {
        parameters['Item Category'] = parameters[key];
      } else if ('cu' === key) {
        parameters['Currency Code'] = parameters[key];
      }
      // Enhanced E-commerce
      else if (/pr\d+id/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product SKU ' + productIdx] = parameters[key];
      } else if (/pr\d+nm/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Name ' + productIdx] = parameters[key];
      } else if (/pr\d+br/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Brand ' + productIdx] = parameters[key];
      } else if (/pr\d+ca/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Category ' + productIdx] = parameters[key];
      } else if (/pr\d+va/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Variant ' + productIdx] = parameters[key];
      } else if (/pr\d+pr/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Price ' + productIdx] = parameters[key];
      } else if (/pr\d+qt/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Quantity ' + productIdx] = parameters[key];
      } else if (/pr\d+cc/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Coupon Code ' + productIdx] = parameters[key];
      } else if (/pr\d+ps/.test(key)) {
        productIdx = key.match(/\d+/)[0];
        parameters['Product Position'] = parameters[key];
      } else if (/pr\d+cd\d+/.test(key)) {
        groups = key.match(/\d+/g);
        productIdx = groups[0];
        cdIdx = groups[1];
        parameters['Product Custom Dimension' + cdIdx + ' ' + productIdx] = parameters[key];
      } else if (/pr\d+cm\d+/.test(key)) {
        groups = key.match(/\d+/g);
        productIdx = groups[0];
        cdIdx = groups[1];
        parameters['Product Custom Metric' + cdIdx + ' ' + productIdx] = parameters[key];
      } else if ('pa' === key) {
        parameters['Product Action'] = parameters[key];
      } else if ('tcc' === key) {
        parameters['Coupon Code'] = parameters[key];
      } else if ('pal' === key) {
        parameters['Product Action List'] = parameters[key];
      } else if ('cos' === key) {
        parameters['Checkout Step'] = parameters[key];
      } else if ('col' === key) {
        parameters['Checkout Step Option'] = parameters[key];
      } else if (/il\d+nm/.test(key)) {
        listIdx = key.match(/\d+/)[0];
        parameters['Product Impression List Name ' + listIdx] = parameters[key];
      } else if (/il\d+pi\d+id/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression SKU ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+nm/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression Name ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+br/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression Brand ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+ca/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression Category ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+va/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression Variant ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+ps/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression Position ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+pr/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        parameters[listIdx + ' - Product Impression Price ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+cd\d+/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        cdIdx = groups[2];
        parameters[listIdx + ' - Product Impression Custom Dimension' + cdIdx + ' ' + productIdx] = parameters[key];
      } else if (/il\d+pi\d+cm\d+/.test(key)) {
        groups = key.match(/\d+/g);
        listIdx = groups[0];
        productIdx = groups[1];
        cdIdx = groups[2];
        parameters[listIdx + ' - Product Impression Custom Metric' + cdIdx + ' ' + productIdx] = parameters[key];
      } else if (/promo\d+id/.test(key)) {
        promoIdx = key.match(/\d+/)[0];
        parameters['Promotion ID ' + promoIdx] = parameters[key];
      } else if (/promo\d+nm/.test(key)) {
        promoIdx = key.match(/\d+/)[0];
        parameters['Promotion Name ' + promoIdx] = parameters[key];
      } else if (/promo\d+cr/.test(key)) {
        promoIdx = key.match(/\d+/)[0];
        parameters['Promotion Creative ' + promoIdx] = parameters[key];
      } else if (/promo\d+ps/.test(key)) {
        promoIdx = key.match(/\d+/)[0];
        parameters['Promotion Position ' + promoIdx] = parameters[key];
      } else if (/promoa/.test(key)) {
        parameters['Promotion Action'] = parameters[key];
      }
      // Social Interactions
      else if ('sn' === key) {
        parameters['Social Network'] = parameters[key];
      } else if ('sa' === key) {
        parameters['Social Action'] = parameters[key];
      } else if ('st' === key) {
        parameters['Social Target'] = parameters[key];
      }
      // Timing
      else if ('utc' === key) {
        parameters['User Timing Category'] = parameters[key];
      } else if ('utv' === key) {
        parameters['User Timing Variable'] = parameters[key];
      } else if ('utt' === key) {
        parameters['User Timing Time'] = parameters[key];
      } else if ('utl' === key) {
        parameters['User Timing Label'] = parameters[key];
      }
      // Exceptions
      else if ('exd' === key) {
        parameters['Exception Description'] = parameters[key];
      } else if ('exf' === key) {
        parameters['Exception Fatal'] = parameters[key];
      }
      // Custom Dimensions / Metrics
      else if (/^cd/.test(key)) {
        cdIdx = key.match(/\d+/)[0];
        parameters['Custom Dimension ' + cdIdx] = parameters[key];
      } else if (/^cm/.test(key)) {
        cdIdx = key.match(/\d+/)[0];
        parameters['Custom Metric ' + cdIdx] = parameters[key];
      } else {
        // Other - Non Documented yet
        skipDeletion = true;
      }

      if (!skipDeletion) {
        delete parameters[key];
      }

    }
  };

  var capitalizeFirstLetter = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

})();
