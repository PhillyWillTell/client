//
//  KBSignupView.h
//  Keybase
//
//  Created by Gabriel on 2/9/15.
//  Copyright (c) 2015 Gabriel Handford. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "KBAppDefines.h"
#import "KBRPC.h"
#import "KBContentView.h"

@class KBSignupView;

@protocol KBSignupViewDelegate
- (void)signupViewDidSignup:(KBSignupView *)signupView;
@end


@interface KBSignupView : KBContentView <NSTextFieldDelegate, KBTextFieldFocusDelegate>
@property (weak) id<KBSignupViewDelegate> delegate;

@property KBTextField *emailField;
@property KBTextField *usernameField;
@property KBTextField *deviceNameField;

@property KBButton *loginButton;
@property KBButton *signupButton;

- (void)viewDidAppear:(BOOL)animated;

@end
