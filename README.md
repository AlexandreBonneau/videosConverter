## What is *Videos Converter*?

As you guessed it, `videosConverter` is a script that converts videos shot for instance by your phone or any other devices, into the x265 format.

By default, it outputs the new video files into the `./x265` directory, if none is passed as the second argument.

The conversion subsequently returns **much** smaller files for the same quality.

### How to use?
 
1. Download the code using `git clone https://gitlab.com/AnotherLinuxUser/videosConverter.git`
2. `cd videosConverter`
3. Execute the *node* program by giving it the correct parameters:
 
 ```bash
nodejs src/videosConverter.js /path/to/phone/CameraDir /path/output/dir
```

### Conversion ratio

I tested the script on 329 files totalling 74GB, and it converted those into a 14GB size directory.<br>
In average, converting your 1080p 60fps phone videos will get you a **80%** compression rate!

*Note: To give you an idea, it tooks approximatively 115 hours to finish on my 6 years old i3-2105 with 8GB RAM.<br>
You can see the conversion log [here](https://gist.github.com/AlexandreBonneau/dddd33044f21e2078fe3d379804fdc52).* 

### Caveat

It takes time and lots of CPU cycles to convert videos ; use a multiprocessor CPU if possible.

### License

`videosConverter` is a [GPLv3](https://www.gnu.org/licenses/#GPL)-licensed open source project.
 
****
 
If you find this code useful, feel free to make donation to support its development [![Donate][patreon-image]][patreon-url].

[patreon-url]: https://www.patreon.com/AlexandreBonneau
[patreon-image]: https://img.shields.io/badge/patreon-donate-orange.svg
 
