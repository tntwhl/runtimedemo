var hubble = window.hubble = {};

hubble.init = function (json) {
    var children = [];
    var attributes = {};

    for (var name in json) {
        var subJSON = json[name];

        switch (name) {
            case "backStage":
                children.push(parseStage(subJSON, 'back'));
                break;

            case "frontStage":
                children.push(parseStage(subJSON, 'front'));
                break;

            case "pages":
                children.push(parsePages(subJSON));
                break;

            case 'attributes':
                attributes = parseAttribute(subJSON);
                break;

            default:
                break;
        }
    }

    var container = document.querySelector('.lg-container');
    Rosetta.render(Rosetta.create('div', attributes, children), container);
    $('#loading').remove();
    container.style.opacity = 1;
};

function parseStage(json, type) {
    var components = parseComponents(json.components);
    var attributes = parseAttribute(json.attributes) || {};
    attributes = $.extend(attributes, {
        class: 'lg-' + type + '-stage'
    });

    return Rosetta.create('div', attributes, components);
}

function parsePages(arr) {
    var pages = [];

    (arr || []).map(function(pageJSON, index) {
        var name = 'lg-page swiper-slide';

        var page = Rosetta.create('div', {
            class: name,
            style: 'height:' + document.querySelector(".lg-container").clientHeight + 'px'
        }, parseComponents(pageJSON.components));

        pages.push(page);
    });

    return Rosetta.create('div', {
        class: 'lg-page-container swiper-container'
    }, Rosetta.create('div', {
        class: 'lg-page-wrapper swiper-wrapper'
    }, pages));
}

function parseAttribute(json) {
    return {};
}

function parseComponents(components) {
    var result = [];
    result.push(Rosetta.create('div', {
        class: 'lg-backface'
    }))

    components.map(function(component, index) {
        var createComponent = null;

        if (component.type == 'image') {
            createComponent = createImage;
        } else if (component.type == 'label') {
            createComponent = createLabel;
        }

        var item = createComponent(component);


        result.push(item);
    });

    return result;
}


function createImage(json) {
    var coordinate = getCoodinate(json.surface);
    var position = [];
    var size = [];
    var ani = getAnimation(json.animations);
    var type = ani.name
    var animation = ani.animation

    for (var key in coordinate) {
        if (key == 'width' || key == 'height') {
            size.push(key + ':' + coordinate[key] + ';');
        }

        position.push(key + ':' + coordinate[key] + ';');
    }


    for (var key in animation) {
        position.push(key + ':' + animation[key] + ';');
    }

    size = size.join('');
    position = position.join('');

    var link = json.surface.link || '';
    console.log(link);

    return Rosetta.create('div', {
            class: 'lg-trailer animated ' + type ,
            style: position,
            'data-link': link
        }, Rosetta.create('div', {
            class: 'lg-surface',
            style: size
        }, Rosetta.create('img', {
            class: 'lg-component-img',
            src: json.attributes.src,
            style: size
        })));
}


function createLabel(json) {
    return Rosetta.create('div', {
            class: 'lg-trailer'
        }, Rosetta.create('div', {
            class: 'lg-surface'
        }, Rosetta.create('div', {
            class: 'lg-component-label'
        })));
}

function getAnimation(json) {
    var enter = json.enter;
    var name = '';
    var ani = {
        '-webkit-animation-duration': '1s',
        '-webkit-animation-delay': '0s',
        '-webkit-animation-iteration-count': 1,
        '-webkit-animation-direction': 'normal',
        '-webkit-animation-fill-mode': 'backwards'
    };
    var flag = false;

    for (var key in enter) {
        flag = true;
        if (key == 'name') {
            name = enter[key];
        } else if (key == 'repeat') {
            ani['-webkit-animation-iteration-count'] = enter[key];
        } else if (key == 'delay') {
            ani['-webkit-animation-delay'] = enter[key] + 's';
        } else {
            ani['-webkit-animation-' + key] = enter[key];
        }
    }

    if (!flag) {
        ani = {};
    }

    return {
        name: name,
        animation: ani
    };
}

function getCoodinate(surface) {
    var height = document.querySelector(".lg-container").clientHeight/2;

    var t = 325;

    height = height || t;

    var result = {
        left: surface.x + "px",
        width: surface.width + "px",
        height: surface.height + "px"
    };
    switch (surface.coordinate) {
        case "bottom":
            result.bottom = -surface.height - surface.y + "px";
            break;
        case "central":
            result.top = surface.y + height + "px";
            break;
        default:
            result.top = surface.y + "px"
    }
    return result;
}