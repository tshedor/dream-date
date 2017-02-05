# Dream Date

A location-based audio story, [Dream Date](http://dreamdateapp.com/) follows a head-in-the-clouds narrator as he waits for his blind date at a science museum. It was originally presented as a mobile web app at the 2016 Valentine's Day edition of OMSI After Dark in Portland, OR. The story was [written, recorded, and produced](https://timshedor.com/dream-date/) by Will Chertoff, Max Ono, and Tim Shedor.

To develop locally:
```bash
$ git clone git@github.com:tshedor/dream-date.git
$ cd dream-date
$ bundle install # Ruby 2 <= required
$ middleman s
```

## License

All original code include in this repo (`*.js`, `*.slim`, `*.scss`) is available under the [MIT license](LICENSE). Please contact us for permission to share or adapt other assets (`*.mp3`, `*.jpg`, `*.png`, `*.svg`, [the story](source/transcripts)) by submitting an issue (attribution will always be required). Libraries included in this repo - [Modernizr](https://modernizr.com/download?flexbox-touchevents-dontmin-setclasses), [Frob Core](https://github.com/wearefine/frob-core), [Normalize](https://necolas.github.io/normalize.css/) - as well as the [`detectPrefixes`](source/javascripts/dd.utils.js#10) and [`translate`](source/javascripts/dd.utils.js#62) functions were originally released under the MIT license.
