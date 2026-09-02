# File Structure

```
c:\animus.ai/
├── requirements.txt
├── animus/                          # Virtual environment
│   ├── pyvenv.cfg
│   ├── etc/
│   │   └── jupyter/
│   │       ├── jupyter_notebook_config.d/
│   │       ├── jupyter_server_config.d/
│   │       └── nbconfig/
│   ├── Include/
│   ├── Lib/
│   │   └── site-packages/           # Python packages and dependencies
│   │       ├── ipykernel_launcher.py
│   │       ├── ipython_pygments_lexers.py
│   │       ├── jupyter.py
│   │       ├── pylab.py
│   │       ├── typing_extensions.py
│   │       ├── _argon2_cffi_bindings/
│   │       ├── _yaml/
│   │       ├── anyio/
│   │       ├── argon2/
│   │       ├── arrow/
│   │       ├── attrs/
│   │       ├── babel/
│   │       ├── beautifulsoup4/
│   │       ├── bleach/
│   │       ├── bs4/
│   │       ├── certifi/
│   │       ├── cffi/
│   │       ├── charset_normalizer/
│   │       ├── cloudpickle/
│   │       ├── colorama/
│   │       ├── comm/
│   │       ├── contourpy/
│   │       ├── cycler/
│   │       ├── dateutil/
│   │       ├── debugpy/
│   │       ├── defusedxml/
│   │       ├── executing/
│   │       ├── fastjsonschema/
│   │       ├── fontTools/
│   │       └── ... (additional packages)
│   ├── Scripts/
│   │   ├── activate
│   │   ├── activate.bat
│   │   ├── activate.fish
│   │   ├── Activate.ps1
│   │   ├── deactivate.bat
│   │   ├── jsonpointer
│   │   └── numba
│   └── share/
│       ├── applications/
│       ├── icons/
│       ├── jupyter/
│       └── man/
├── app/                             # Main application code
│   ├── __init__.py
│   ├── main.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── transaction.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── fraud_detector.py
│   └── utils/
│       └── __init__.py
├── data/                            # Data directory
│   ├── handbook/
│   │   ├── README.md
│   │   └── data/
│   ├── ieee_cis/
│   │   ├── sample_submission.csv
│   │   ├── test_identity.csv
│   │   ├── test_transaction.csv
│   │   ├── train_identity.csv
│   │   └── train_transaction.csv
│   └── processed/
├── models/                          # Models directory
└── notebooks/                       # Jupyter notebooks
    └── 01_data_exploration.ipynb
```

## Summary

- **animus/**: Python virtual environment with all dependencies
- **app/**: Main application code with modules for schemas, services, and utilities
- **data/**: Data files including IEEE CIS fraud detection dataset and handbook
- **models/**: Model storage directory
- **notebooks/**: Jupyter notebooks for data exploration
- **requirements.txt**: Project dependencies
